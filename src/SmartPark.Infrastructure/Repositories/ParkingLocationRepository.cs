using Microsoft.EntityFrameworkCore;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Interfaces.Repositories;
using SmartPark.Infrastructure.Data;

namespace SmartPark.Infrastructure.Repositories;

public class ParkingLocationRepository : BaseRepository<ParkingLocation>, IParkingLocationRepository
{
    public ParkingLocationRepository(SmartParkDbContext context) : base(context) { }

    public async Task<IEnumerable<ParkingLocation>> GetByCityAsync(string city) =>
        await _dbSet.Include(l => l.ParkingSlots)
                    .Where(l => l.City.ToLower() == city.ToLower() && l.IsActive)
                    .ToListAsync();

    public async Task<IEnumerable<ParkingLocation>> GetActiveLocationsAsync() =>
        await _dbSet.Include(l => l.ParkingSlots)
                    .Where(l => l.IsActive)
                    .ToListAsync();
}
