using SmartPark.Domain.Enums;

namespace SmartPark.Domain.Interfaces.Repositories;

public interface IAnalyticsRepository
{
    // ── Dashboard counts ──────────────────────────────────────────────────────
    Task<int>     CountTotalSlotsAsync();
    Task<int>     CountSlotsByStatusAsync(SlotStatus status);
    Task<int>     CountTotalReservationsAsync();
    Task<int>     CountReservationsTodayAsync(DateTime todayUtc);
    Task<int>     CountActiveReservationsAsync();
    Task<int>     CountActiveLocationsAsync();
    Task<int>     CountUsersByRoleAsync(UserRole role);
    Task<int>     CountSuccessfulPaymentsAsync();
    Task<decimal> SumRevenueTotalAsync();
    Task<decimal> SumRevenueTodayAsync(DateTime todayUtc);

    // ── Peak hours / days ─────────────────────────────────────────────────────
    Task<IEnumerable<(int Hour, int Count)>>    GetBookingCountsByHourAsync();
    Task<IEnumerable<(int DayOfWeek, int Count)>> GetBookingCountsByDayOfWeekAsync();

    // ── Trends ────────────────────────────────────────────────────────────────
    Task<IEnumerable<(DateTime Date, int Count)>>      GetReservationCountsByDateAsync(DateTime from, DateTime to);
    Task<IEnumerable<(DateTime Date, decimal Revenue)>> GetRevenueByDateAsync(DateTime from, DateTime to);
    Task<IEnumerable<(DateTime Date, int Count)>>      GetConfirmedCountsByDateAsync(DateTime from, DateTime to);

    // ── Location performance ──────────────────────────────────────────────────
    Task<IEnumerable<(int LocationId, string Name, string City, int TotalSlots, int Reservations, decimal Revenue)>>
        GetLocationPerformanceAsync();
}
