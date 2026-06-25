using SmartPark.Application.DTOs.Analytics;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Enums;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Application.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly IUnitOfWork _uow;

    public AnalyticsService(IUnitOfWork uow) => _uow = uow;

    // ─── Dashboard Stats ────────────────────────────────────────────────────────

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var today = DateTime.UtcNow;

        return new DashboardStatsDto
        {
            TotalSlots         = await _uow.Analytics.CountTotalSlotsAsync(),
            AvailableSlots     = await _uow.Analytics.CountSlotsByStatusAsync(SlotStatus.Available),
            OccupiedSlots      = await _uow.Analytics.CountSlotsByStatusAsync(SlotStatus.Reserved),
            MaintenanceSlots   = await _uow.Analytics.CountSlotsByStatusAsync(SlotStatus.Maintenance),
            TotalReservations  = await _uow.Analytics.CountTotalReservationsAsync(),
            TodayReservations  = await _uow.Analytics.CountReservationsTodayAsync(today),
            ActiveReservations = await _uow.Analytics.CountActiveReservationsAsync(),
            TotalLocations     = await _uow.Analytics.CountActiveLocationsAsync(),
            TotalCustomers     = await _uow.Analytics.CountUsersByRoleAsync(UserRole.Customer),
            TotalPayments      = await _uow.Analytics.CountSuccessfulPaymentsAsync(),
            TotalRevenue       = await _uow.Analytics.SumRevenueTotalAsync(),
            TodayRevenue       = await _uow.Analytics.SumRevenueTodayAsync(today),
        };
    }

    // ─── Peak Hours ──────────────────────────────────────────────────────────────

    public async Task<IEnumerable<PeakHourDto>> GetPeakBookingHoursAsync()
    {
        var countsByHour = (await _uow.Analytics.GetBookingCountsByHourAsync())
            .ToDictionary(x => x.Hour, x => x.Count);

        return Enumerable.Range(0, 24).Select(hour => new PeakHourDto
        {
            Hour         = hour,
            HourLabel    = FormatHourLabel(hour),
            BookingCount = countsByHour.TryGetValue(hour, out var count) ? count : 0
        });
    }

    // ─── Peak Days ───────────────────────────────────────────────────────────────

    public async Task<IEnumerable<PeakDayDto>> GetPeakBookingDaysAsync()
    {
        var countsByDay = (await _uow.Analytics.GetBookingCountsByDayOfWeekAsync())
            .ToDictionary(x => x.DayOfWeek, x => x.Count);

        var dayNames = new[] { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };

        return Enumerable.Range(0, 7).Select(day => new PeakDayDto
        {
            DayOfWeek    = day,
            DayName      = dayNames[day],
            BookingCount = countsByDay.TryGetValue(day, out var count) ? count : 0
        });
    }

    // ─── Reservation Trend ───────────────────────────────────────────────────────

    public async Task<IEnumerable<TrendPointDto>> GetReservationTrendAsync(int days = 30)
    {
        var today = DateTime.UtcNow.Date;
        var from  = today.AddDays(-(days - 1));

        var countsByDate = (await _uow.Analytics.GetReservationCountsByDateAsync(from, today.AddDays(1)))
            .ToDictionary(x => x.Date, x => x.Count);

        return Enumerable.Range(0, days)
            .Select(i => from.AddDays(i))
            .Select(date => new TrendPointDto
            {
                Date             = date.ToString("MMM dd"),
                ReservationCount = countsByDate.TryGetValue(date, out var cnt) ? cnt : 0,
                Revenue          = 0,
                OccupancyPercent = 0
            });
    }

    // ─── Revenue Trend ───────────────────────────────────────────────────────────

    public async Task<IEnumerable<TrendPointDto>> GetRevenueTrendAsync(int days = 30)
    {
        var today = DateTime.UtcNow.Date;
        var from  = today.AddDays(-(days - 1));

        var revenueByDate = (await _uow.Analytics.GetRevenueByDateAsync(from, today.AddDays(1)))
            .ToDictionary(x => x.Date, x => x.Revenue);

        return Enumerable.Range(0, days)
            .Select(i => from.AddDays(i))
            .Select(date => new TrendPointDto
            {
                Date             = date.ToString("MMM dd"),
                ReservationCount = 0,
                Revenue          = revenueByDate.TryGetValue(date, out var rev) ? rev : 0m,
                OccupancyPercent = 0
            });
    }

    // ─── Occupancy Trend ─────────────────────────────────────────────────────────

    public async Task<IEnumerable<TrendPointDto>> GetOccupancyTrendAsync(int days = 30)
    {
        var today      = DateTime.UtcNow.Date;
        var from       = today.AddDays(-(days - 1));
        var totalSlots = await _uow.Analytics.CountTotalSlotsAsync();

        if (totalSlots == 0)
            return Enumerable.Range(0, days).Select(i => new TrendPointDto
            {
                Date = from.AddDays(i).ToString("MMM dd"),
                ReservationCount = 0, Revenue = 0, OccupancyPercent = 0
            });

        var confirmedByDate = (await _uow.Analytics.GetConfirmedCountsByDateAsync(from, today.AddDays(1)))
            .ToDictionary(x => x.Date, x => x.Count);

        return Enumerable.Range(0, days)
            .Select(i => from.AddDays(i))
            .Select(date =>
            {
                var confirmed = confirmedByDate.TryGetValue(date, out var cnt) ? cnt : 0;
                var occupancy = Math.Min(100.0, (double)confirmed / totalSlots * 100.0);
                return new TrendPointDto
                {
                    Date             = date.ToString("MMM dd"),
                    ReservationCount = 0,
                    Revenue          = 0,
                    OccupancyPercent = Math.Round(occupancy, 2)
                };
            });
    }

    // ─── Location Performance ────────────────────────────────────────────────────

    public async Task<IEnumerable<LocationPerformanceDto>> GetLocationPerformanceAsync()
    {
        var rows = await _uow.Analytics.GetLocationPerformanceAsync();

        return rows.Select(r =>
        {
            var occupancy = r.TotalSlots > 0
                ? Math.Min(100.0, (double)r.Reservations / r.TotalSlots * 100.0)
                : 0.0;
            return new LocationPerformanceDto
            {
                LocationId       = r.LocationId,
                LocationName     = r.Name,
                City             = r.City,
                TotalSlots       = r.TotalSlots,
                ReservationCount = r.Reservations,
                Revenue          = r.Revenue,
                OccupancyPercent = Math.Round(occupancy, 2)
            };
        });
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private static string FormatHourLabel(int hour)
    {
        if (hour == 0)  return "12 AM";
        if (hour == 12) return "12 PM";
        return hour < 12 ? $"{hour} AM" : $"{hour - 12} PM";
    }
}
