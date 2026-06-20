namespace SmartPark.Application.Interfaces;

public interface IPricingService
{
    Task<decimal> CalculateAsync(int locationId, DateTime startTime, DateTime endTime);
    Task<decimal> GetEstimateAsync(int locationId, int durationMinutes);
}
