using Microsoft.EntityFrameworkCore;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Enums;
using SmartPark.Domain.Interfaces.Repositories;
using SmartPark.Infrastructure.Data;

namespace SmartPark.Infrastructure.Repositories;

public class ParkingSlotRepository : BaseRepository<ParkingSlot>, IParkingSlotRepository
{
    public ParkingSlotRepository(SmartParkDbContext context) : base(context) { }

    public async Task<ParkingSlot?> GetByIdWithLocationAsync(int id) =>
        await _dbSet.Include(s => s.Location).AsNoTracking().FirstOrDefaultAsync(s => s.ID == id);

    public async Task<IEnumerable<ParkingSlot>> GetByLocationIdAsync(int locationId)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(s => s.Location)
            .Include(s => s.Reservations.Where(r =>
                r.Status != ReservationStatus.Cancelled &&
                r.StartTime <= now &&
                r.EndTime > now))
            .Where(s => s.LocationID == locationId)
            .ToListAsync();
    }

    public async Task<IEnumerable<ParkingSlot>> GetAvailableSlotsByLocationAsync(int locationId)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(s => s.Location)
            .Include(s => s.Reservations.Where(r =>
                r.Status != ReservationStatus.Cancelled &&
                r.StartTime <= now &&
                r.EndTime > now))
            .Where(s => s.LocationID == locationId && s.Status != SlotStatus.Maintenance)
            .ToListAsync();
    }

    public async Task<int> GetAvailableSlotCountAsync(int locationId)
    {
        var now = DateTime.UtcNow;
        return await _dbSet.CountAsync(s =>
            s.LocationID == locationId &&
            s.Status != SlotStatus.Maintenance &&
            !s.Reservations.Any(r =>
                r.Status != ReservationStatus.Cancelled &&
                r.StartTime <= now &&
                r.EndTime > now));
    }

    public async Task<IEnumerable<ParkingSlot>> GetByOwnerAsync(int ownerId) =>
        await _dbSet.Include(s => s.Location)
                    .Where(s => s.Location.OwnerID == ownerId)
                    .ToListAsync();
}
