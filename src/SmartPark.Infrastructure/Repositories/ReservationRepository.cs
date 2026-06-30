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

    public async Task<Reservation?> GetByIdWithDetailsAsync(int id) =>
        await _dbSet.Include(r => r.User)
                    .Include(r => r.ParkingSlot).ThenInclude(s => s.Location)
                    .Include(r => r.Payment)
                    .FirstOrDefaultAsync(r => r.ID == id);

    // Cancelled reservations never block. Pending reservations expire after 15 min (abandoned unpaid bookings).
    // Also blocks if a previous occupant is physically still in the slot (checked in, not checked out, booking expired).
    public async Task<bool> IsSlotAvailableAsync(int slotId, DateTime startTime, DateTime endTime)
    {
        var pendingExpiry = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified).AddMinutes(-15);

        var hasBookingConflict = await _dbSet.AnyAsync(r =>
            r.SlotID == slotId &&
            r.Status != ReservationStatus.Cancelled &&
            !(r.Status == ReservationStatus.Pending && r.ReservationDate < pendingExpiry) &&
            r.StartTime < endTime &&
            r.EndTime > startTime);

        if (hasBookingConflict) return false;

        // Physical occupancy: someone checked in, not yet checked out, and their booking ended before new one starts
        var isPhysicallyOccupied = await _dbSet.AnyAsync(r =>
            r.SlotID == slotId &&
            r.CheckInTime != null &&
            r.CheckOutTime == null &&
            r.EndTime <= startTime);

        return !isPhysicallyOccupied;
    }
}
