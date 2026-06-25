using SmartPark.Application.DTOs.ParkingLocation;

namespace SmartPark.Application.Interfaces;

public interface IParkingLocationService
{
    Task<IEnumerable<ParkingLocationDto>> GetAllAsync();
    Task<IEnumerable<ParkingLocationDto>> GetAllForAdminAsync();
    Task<IEnumerable<ParkingLocationDto>> GetByCityAsync(string city);
    Task<IEnumerable<ParkingLocationDto>> GetByOwnerAsync(int ownerId);
    Task<ParkingLocationDto> GetByIdAsync(int id);
    Task<ParkingLocationDto> CreateAsync(CreateParkingLocationRequest request, int ownerId);
    Task<ParkingLocationDto> UpdateAsync(int id, UpdateParkingLocationRequest request, int callerId, bool isAdmin);
    Task DeleteAsync(int id, int callerId, bool isAdmin);
}
