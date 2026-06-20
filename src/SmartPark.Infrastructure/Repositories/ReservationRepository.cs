using Microsoft.EntityFrameworkCore;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Enums;
using SmartPark.Domain.Interfaces.Repositories;
using SmartPark.Infrastructure.Data;

namespace SmartPark.Infrastructure.Repositories;

public class ReservationRepository : BaseRepository<Reservation>, IReservationRepository
{
    public ReservationRepository(SmartParkDbContext context) : base(context) { }

    public async Task<IEnumerable<Reservation>> GetByUserIdAsync(int userId) =>
        await _dbSet.Include(r => r.ParkingSlot).ThenInclude(s => s.Location)
                    .Include(r => r.Payment)
                    .Where(r => r.UserID == userId)
                    .OrderByDescending(r => r.ReservationDate)
                    .ToListAsync();

    public async Task<IEnumerable<Reservation>> GetBySlotIdAsync(int slotId) =>
        await _dbSet.Where(r => r.SlotID == slotId).ToListAsync();

    // Rule: Cancelled reservations are excluded from availability check
    public async Task<bool> IsSlotAvailableAsync(int slotId, DateTime startTime, DateTime endTime) =>
        !await _dbSet.AnyAsync(r =>
            r.SlotID == slotId &&
            r.Status != ReservationStatus.Cancelled &&
            r.StartTime < endTime &&
            r.EndTime > startTime);
}
