using Microsoft.EntityFrameworkCore;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Enums;
using SmartPark.Domain.Interfaces.Repositories;
using SmartPark.Infrastructure.Data;

namespace SmartPark.Infrastructure.Repositories;

public class ParkingLocationRepository : BaseRepository<ParkingLocation>, IParkingLocationRepository
{
    public ParkingLocationRepository(SmartParkDbContext context) : base(context) { }

    public async Task<IEnumerable<ParkingLocation>> GetByCityAsync(string city)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(l => l.Owner)
            .Include(l => l.ParkingSlots)
                .ThenInclude(s => s.Reservations.Where(r =>
                    r.Status != ReservationStatus.Cancelled &&
                    r.StartTime <= now &&
                    r.EndTime > now))
            .Where(l => l.City.ToLower() == city.ToLower() && l.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<ParkingLocation>> GetActiveLocationsAsync()
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(l => l.Owner)
            .Include(l => l.ParkingSlots)
                .ThenInclude(s => s.Reservations.Where(r =>
                    r.Status != ReservationStatus.Cancelled &&
                    r.StartTime <= now &&
                    r.EndTime > now))
            .Where(l => l.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<ParkingLocation>> GetAllLocationsAsync()
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(l => l.Owner)
            .Include(l => l.ParkingSlots)
                .ThenInclude(s => s.Reservations.Where(r =>
                    r.Status != ReservationStatus.Cancelled &&
                    r.StartTime <= now &&
                    r.EndTime > now))
            .ToListAsync();
    }

    public async Task<IEnumerable<ParkingLocation>> GetByOwnerAsync(int ownerId)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(l => l.Owner)
            .Include(l => l.ParkingSlots)
                .ThenInclude(s => s.Reservations.Where(r =>
                    r.Status != ReservationStatus.Cancelled &&
                    r.StartTime <= now &&
                    r.EndTime > now))
            .Where(l => l.OwnerID == ownerId)
            .ToListAsync();
    }

    public async Task<IEnumerable<ParkingLocation>> GetActiveLocationsByOwnerAsync(int ownerId)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(l => l.Owner)
            .Include(l => l.ParkingSlots)
                .ThenInclude(s => s.Reservations.Where(r =>
                    r.Status != ReservationStatus.Cancelled &&
                    r.StartTime <= now &&
                    r.EndTime > now))
            .Where(l => l.OwnerID == ownerId && l.IsActive)
            .ToListAsync();
    }
}
