using SmartPark.Application.DTOs.Pricing;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Exceptions;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Infrastructure.Services;

public class PricingService : IPricingService
{
    private readonly IUnitOfWork _uow;

    public PricingService(IUnitOfWork uow) => _uow = uow;

    public async Task<PriceEstimateDto> EstimatePriceAsync(int slotId, DateTime startTime, DateTime endTime)
    {
        var slot = await _uow.ParkingSlots.GetByIdWithLocationAsync(slotId)
            ?? throw new DomainException($"Slot {slotId} not found.");

        var locationId = slot.LocationID;
        var config = await _uow.PricingConfigs.GetByLocationIdAsync(locationId);

        var (pricingType, rate) = DetermineRate(config, slot.HourlyRate, startTime);
        var hours = Math.Max((decimal)(endTime - startTime).TotalHours, 0m);
        var total = Math.Round(rate * hours, 2);

        var breakdown = FormatBreakdown(pricingType, hours, rate, total);

        var (available, occupied, totalSlots) = await GetSlotCounts(locationId);
        var (demandLevel, demandMessage) = CalcDemand(config, startTime);
        var (isPeakActive, peakMessage) = CheckCurrentPeak(config);

        return new PriceEstimateDto(
            pricingType,
            (double)hours,
            rate,
            total,
            breakdown,
            demandLevel,
            demandMessage,
            available,
            occupied,
            isPeakActive,
            peakMessage
        );
    }

    public async Task<decimal> CalculateAmountAsync(int slotId, DateTime startTime, DateTime endTime)
    {
        var slot = await _uow.ParkingSlots.GetByIdWithLocationAsync(slotId)
            ?? throw new DomainException($"Slot {slotId} not found.");

        var config = await _uow.PricingConfigs.GetByLocationIdAsync(slot.LocationID);
        var (_, rate) = DetermineRate(config, slot.HourlyRate, startTime);
        var hours = Math.Max((decimal)(endTime - startTime).TotalHours, 0m);
        return Math.Round(rate * hours, 2);
    }

    public async Task<DemandDto> GetDemandAsync(int locationId)
    {
        var location = await _uow.ParkingLocations.GetByIdAsync(locationId)
            ?? throw new DomainException($"Location {locationId} not found.");

        var config = await _uow.PricingConfigs.GetByLocationIdAsync(locationId);
        var (available, occupied, totalSlots) = await GetSlotCounts(locationId);
        var (demandLevel, demandMessage) = CalcDemand(config, DateTime.Now);
        var (isPeakActive, peakMessage) = CheckCurrentPeak(config);
        var occupancyRate = totalSlots > 0 ? (double)occupied / totalSlots : 0.0;

        return new DemandDto(
            demandLevel,
            demandMessage,
            available,
            occupied,
            totalSlots,
            Math.Round(occupancyRate, 4),
            isPeakActive,
            peakMessage
        );
    }

    public async Task<PricingConfigDto> GetConfigAsync(int locationId)
    {
        var config = await _uow.PricingConfigs.GetByLocationIdAsync(locationId);
        if (config == null)
        {
            // Return defaults — normalRate from first slot's hourlyRate if available
            var slots = await _uow.ParkingSlots.GetByLocationIdAsync(locationId);
            var defaultRate = slots.FirstOrDefault()?.HourlyRate ?? 50m;
            return new PricingConfigDto(locationId, defaultRate, false, 8, 12, defaultRate, false, 10, 22, defaultRate);
        }
        return ToDto(config);
    }

    public async Task<PricingConfigDto> SaveConfigAsync(int locationId, SavePricingConfigRequest request)
    {
        var existing = await _uow.PricingConfigs.GetByLocationIdAsync(locationId);
        if (existing == null)
        {
            existing = new PricingConfig { LocationID = locationId };
            await _uow.PricingConfigs.AddAsync(existing);
        }

        existing.NormalRate             = request.NormalRate;
        existing.WeekdayPeakEnabled     = request.WeekdayPeakEnabled;
        existing.WeekdayPeakStartHour   = request.WeekdayPeakStartHour;
        existing.WeekdayPeakEndHour     = request.WeekdayPeakEndHour;
        existing.WeekdayPeakRate        = request.WeekdayPeakRate;
        existing.WeekendPeakEnabled     = request.WeekendPeakEnabled;
        existing.WeekendPeakStartHour   = request.WeekendPeakStartHour;
        existing.WeekendPeakEndHour     = request.WeekendPeakEndHour;
        existing.WeekendPeakRate        = request.WeekendPeakRate;

        await _uow.SaveChangesAsync();
        return ToDto(existing);
    }

    // ── Private helpers ─────────────────────────────────────────────────────────

    private static (string type, decimal rate) DetermineRate(PricingConfig? config, decimal slotRate, DateTime startTime)
    {
        if (config == null)
            return ("Normal", slotRate);

        // Peak hours are configured in local time — normalize booking time to local before comparing
        var local = startTime.Kind == DateTimeKind.Utc ? startTime.ToLocalTime() : startTime;
        bool isWeekend = local.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday;
        int hour = local.Hour;

        if (isWeekend && config.WeekendPeakEnabled
            && hour >= config.WeekendPeakStartHour && hour < config.WeekendPeakEndHour)
            return ("Weekend Peak", config.WeekendPeakRate);

        if (!isWeekend && config.WeekdayPeakEnabled
            && hour >= config.WeekdayPeakStartHour && hour < config.WeekdayPeakEndHour)
            return ("Weekday Peak", config.WeekdayPeakRate);

        return ("Normal", config.NormalRate);
    }

    private static string FormatBreakdown(string type, decimal hours, decimal rate, decimal total)
    {
        var h = hours % 1 == 0 ? $"{(int)hours}h" : $"{hours:0.##}h";
        return $"{type} — {h} × ₹{rate}/hr = ₹{total:0.##}";
    }

    private async Task<(int available, int occupied, int total)> GetSlotCounts(int locationId)
    {
        var location = await _uow.ParkingLocations.GetByIdAsync(locationId);
        int total = location?.TotalSlots ?? 0;
        int available = await _uow.ParkingSlots.GetAvailableSlotCountAsync(locationId);
        int occupied = total - available;
        return (available, Math.Max(0, occupied), total);
    }

    private static (string level, string message) CalcDemand(PricingConfig? config, DateTime atTime)
    {
        if (config == null)
            return ("Low", "Plenty of parking spaces available.");

        var local = atTime.Kind == DateTimeKind.Utc ? atTime.ToLocalTime() : atTime;
        bool isWeekend = local.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday;
        int hour = local.Hour;

        bool peakEnabled = isWeekend ? config.WeekendPeakEnabled   : config.WeekdayPeakEnabled;
        int  peakStart   = isWeekend ? config.WeekendPeakStartHour : config.WeekdayPeakStartHour;
        int  peakEnd     = isWeekend ? config.WeekendPeakEndHour   : config.WeekdayPeakEndHour;

        if (!peakEnabled)
            return ("Low", "Plenty of parking spaces available.");

        if (hour >= peakStart && hour < peakEnd)
            return ("High", "High demand. Limited slots remaining.");

        int preStart = Math.Max(0, peakStart - 2);
        if (hour >= preStart && hour < peakStart)
            return ("Medium", "Moderate demand. Booking early is recommended.");

        return ("Low", "Plenty of parking spaces available.");
    }

    private static (bool isActive, string message) CheckCurrentPeak(PricingConfig? config)
    {
        if (config == null) return (false, string.Empty);

        var now = DateTime.Now;
        bool isWeekend = now.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday;
        int hour = now.Hour;

        if (isWeekend && config.WeekendPeakEnabled
            && hour >= config.WeekendPeakStartHour && hour < config.WeekendPeakEndHour)
            return (true, "Weekend rush period is active.");

        if (!isWeekend && config.WeekdayPeakEnabled
            && hour >= config.WeekdayPeakStartHour && hour < config.WeekdayPeakEndHour)
            return (true, "Peak pricing is currently active.");

        return (false, string.Empty);
    }

    private static PricingConfigDto ToDto(PricingConfig c) =>
        new(c.LocationID, c.NormalRate,
            c.WeekdayPeakEnabled, c.WeekdayPeakStartHour, c.WeekdayPeakEndHour, c.WeekdayPeakRate,
            c.WeekendPeakEnabled, c.WeekendPeakStartHour, c.WeekendPeakEndHour, c.WeekendPeakRate);
}
