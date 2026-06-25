using Microsoft.EntityFrameworkCore;
using SmartPark.Domain.Enums;
using SmartPark.Domain.Interfaces.Repositories;
using SmartPark.Infrastructure.Data;

namespace SmartPark.Infrastructure.Repositories;

public class AnalyticsRepository : IAnalyticsRepository
{
    private readonly SmartParkDbContext _db;

    public AnalyticsRepository(SmartParkDbContext db) => _db = db;

    // ── Dashboard counts ──────────────────────────────────────────────────────

    public Task<int> CountTotalSlotsAsync() =>
        _db.ParkingSlots.CountAsync();

    public Task<int> CountSlotsByStatusAsync(SlotStatus status) =>
        _db.ParkingSlots.CountAsync(s => s.Status == status);

    public Task<int> CountTotalReservationsAsync() =>
        _db.Reservations.CountAsync();

    public Task<int> CountReservationsTodayAsync(DateTime todayUtc) =>
        _db.Reservations.CountAsync(r => r.ReservationDate.Date == todayUtc.Date);

    public Task<int> CountActiveReservationsAsync() =>
        _db.Reservations.CountAsync(r => r.Status != ReservationStatus.Cancelled);

    public Task<int> CountActiveLocationsAsync() =>
        _db.ParkingLocations.CountAsync(l => l.IsActive);

    public Task<int> CountUsersByRoleAsync(UserRole role) =>
        _db.Users.CountAsync(u => u.Role == role);

    public Task<int> CountSuccessfulPaymentsAsync() =>
        _db.Payments.CountAsync(p => p.PaymentStatus == PaymentStatus.Success || p.PaymentStatus == PaymentStatus.RefundPending);

    public async Task<decimal> SumRevenueTotalAsync() =>
        await _db.Payments
            .Where(p => p.PaymentStatus == PaymentStatus.Success)
            .SumAsync(p => (decimal?)p.Amount) ?? 0m;

    public async Task<decimal> SumRevenueTodayAsync(DateTime todayUtc) =>
        await _db.Payments
            .Where(p => p.PaymentStatus == PaymentStatus.Success && p.PaymentDate.Date == todayUtc.Date)
            .SumAsync(p => (decimal?)p.Amount) ?? 0m;

    // ── Peak hours / days ─────────────────────────────────────────────────────

    public async Task<IEnumerable<(int Hour, int Count)>> GetBookingCountsByHourAsync()
    {
        var results = await _db.Reservations
            .GroupBy(r => r.StartTime.Hour)
            .Select(g => new { Hour = g.Key, Count = g.Count() })
            .ToListAsync();
        return results.Select(x => (x.Hour, x.Count));
    }

    public async Task<IEnumerable<(int DayOfWeek, int Count)>> GetBookingCountsByDayOfWeekAsync()
    {
        var results = await _db.Reservations
            .GroupBy(r => (int)r.ReservationDate.DayOfWeek)
            .Select(g => new { Day = g.Key, Count = g.Count() })
            .ToListAsync();
        return results.Select(x => (x.Day, x.Count));
    }

    // ── Trends ────────────────────────────────────────────────────────────────

    public async Task<IEnumerable<(DateTime Date, int Count)>> GetReservationCountsByDateAsync(DateTime from, DateTime to)
    {
        var results = await _db.Reservations
            .Where(r => r.ReservationDate >= from && r.ReservationDate < to)
            .GroupBy(r => r.ReservationDate.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();
        return results.Select(x => (x.Date, x.Count));
    }

    public async Task<IEnumerable<(DateTime Date, decimal Revenue)>> GetRevenueByDateAsync(DateTime from, DateTime to)
    {
        var results = await _db.Payments
            .Where(p => p.PaymentStatus == PaymentStatus.Success && p.PaymentDate >= from && p.PaymentDate < to)
            .GroupBy(p => p.PaymentDate.Date)
            .Select(g => new { Date = g.Key, Revenue = g.Sum(p => p.Amount) })
            .ToListAsync();
        return results.Select(x => (x.Date, x.Revenue));
    }

    public async Task<IEnumerable<(DateTime Date, int Count)>> GetConfirmedCountsByDateAsync(DateTime from, DateTime to)
    {
        var results = await _db.Reservations
            .Where(r => r.Status == ReservationStatus.Confirmed && r.ReservationDate >= from && r.ReservationDate < to)
            .GroupBy(r => r.ReservationDate.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();
        return results.Select(x => (x.Date, x.Count));
    }

    // ── Location performance ──────────────────────────────────────────────────

    public async Task<IEnumerable<(int LocationId, string Name, string City, int TotalSlots, int Reservations, decimal Revenue)>>
        GetLocationPerformanceAsync()
    {
        var locations = await _db.ParkingLocations.Where(l => l.IsActive).ToListAsync();
        var result = new List<(int, string, string, int, int, decimal)>();

        foreach (var loc in locations)
        {
            var slotIds = await _db.ParkingSlots
                .Where(s => s.LocationID == loc.ID)
                .Select(s => s.ID)
                .ToListAsync();

            var reservationCount = await _db.Reservations
                .CountAsync(r => slotIds.Contains(r.SlotID) && r.Status == ReservationStatus.Confirmed);

            var revenue = await _db.Payments
                .Where(p => p.PaymentStatus == PaymentStatus.Success &&
                            _db.Reservations.Any(r => r.ID == p.ReservationID && slotIds.Contains(r.SlotID)))
                .SumAsync(p => (decimal?)p.Amount) ?? 0m;

            result.Add((loc.ID, loc.LocationName, loc.City, slotIds.Count, reservationCount, revenue));
        }

        return result;
    }
}
