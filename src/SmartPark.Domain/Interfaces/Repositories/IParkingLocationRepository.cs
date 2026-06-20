using SmartPark.Domain.Entities;

namespace SmartPark.Domain.Interfaces.Repositories;

public interface IParkingLocationRepository : IGenericRepository<ParkingLocation>
{
    Task<IEnumerable<ParkingLocation>> GetByCityAsync(string city);
    Task<IEnumerable<ParkingLocation>> GetActiveLocationsAsync();
}
