using SmartPark.Domain.Entities;

namespace SmartPark.Domain.Interfaces.Repositories;

public interface IParkingLocationRepository : IGenericRepository<ParkingLocation>
{
    Task<IEnumerable<ParkingLocation>> GetByCityAsync(string city);
    Task<IEnumerable<ParkingLocation>> GetActiveLocationsAsync();
    Task<IEnumerable<ParkingLocation>> GetAllLocationsAsync();
    Task<IEnumerable<ParkingLocation>> GetByOwnerAsync(int ownerId);
    Task<IEnumerable<ParkingLocation>> GetActiveLocationsByOwnerAsync(int ownerId);
}
