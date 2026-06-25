using SmartPark.Application.DTOs.Analytics;

namespace SmartPark.Application.Interfaces;

public interface IAnalyticsService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<IEnumerable<PeakHourDto>> GetPeakBookingHoursAsync();
    Task<IEnumerable<PeakDayDto>> GetPeakBookingDaysAsync();
    Task<IEnumerable<TrendPointDto>> GetReservationTrendAsync(int days = 30);
    Task<IEnumerable<TrendPointDto>> GetRevenueTrendAsync(int days = 30);
    Task<IEnumerable<TrendPointDto>> GetOccupancyTrendAsync(int days = 30);
    Task<IEnumerable<LocationPerformanceDto>> GetLocationPerformanceAsync();
}
