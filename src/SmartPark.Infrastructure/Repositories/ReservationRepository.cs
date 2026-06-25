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

    public async Task<IEnumerable<Reservation>> GetByOwnerAsync(int ownerId) =>
        await _dbSet.Include(r => r.User)
                    .Include(r => r.ParkingSlot).ThenInclude(s => s.Location)
                    .Include(r => r.Payment)
                    .Where(r => r.ParkingSlot.Location.OwnerID == ownerId)
                    .OrderByDescending(r => r.ReservationDate)
                    .ToListAsync();

    public async Task<IEnumerable<Reservation>> GetAllWithDetailsAsync() =>
        await _dbSet.Include(r => r.User)
                    .Include(r => r.ParkingSlot).ThenInclude(s => s.Location)
                    .Include(r => r.Payment)
                    .OrderByDescending(r => r.ReservationDate)
                    .ToListAsync();

    // Cancelled reservations never block. Pending reservations expire after 15 min (abandoned unpaid bookings).
    public async Task<bool> IsSlotAvailableAsync(int slotId, DateTime startTime, DateTime endTime)
    {
        var pendingExpiry = DateTime.UtcNow.AddMinutes(-15);
        return !await _dbSet.AnyAsync(r =>
            r.SlotID == slotId &&
            r.Status != ReservationStatus.Cancelled &&
            !(r.Status == ReservationStatus.Pending && r.ReservationDate < pendingExpiry) &&
            r.StartTime < endTime &&
            r.EndTime > startTime);
    }
}
