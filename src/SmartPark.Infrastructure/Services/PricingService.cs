using SmartPark.Application.Interfaces;
using SmartPark.Domain.Exceptions;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Infrastructure.Services;

// Dynamic pricing: adjusts rate based on slot occupancy at the location
public class PricingService : IPricingService
{
    private const decimal BaseRatePerHour = 50m;
    private const decimal PeakMultiplier = 1.5m;
    private const decimal HighOccupancyThreshold = 0.8m; // 80% full → peak price

    private readonly IUnitOfWork _uow;

    public PricingService(IUnitOfWork uow) => _uow = uow;

    public async Task<decimal> CalculateAsync(int locationId, DateTime startTime, DateTime endTime)
    {
        var location = await _uow.ParkingLocations.GetByIdAsync(locationId)
            ?? throw new DomainException($"Parking location {locationId} not found.");

        var available = await _uow.ParkingSlots.GetAvailableSlotCountAsync(locationId);
        var occupancy = location.TotalSlots > 0
            ? 1.0 - ((double)available / location.TotalSlots)
            : 1.0;

        var hours = (decimal)(endTime - startTime).TotalHours;
        var rate = occupancy >= (double)HighOccupancyThreshold
            ? BaseRatePerHour * PeakMultiplier
            : BaseRatePerHour;

        return Math.Round(rate * hours, 2);
    }

    public async Task<decimal> GetEstimateAsync(int locationId, int durationMinutes)
    {
        var endTime = DateTime.UtcNow.AddMinutes(durationMinutes);
        return await CalculateAsync(locationId, DateTime.UtcNow, endTime);
    }
}
