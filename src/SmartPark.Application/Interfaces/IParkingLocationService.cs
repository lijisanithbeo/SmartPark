using SmartPark.Application.DTOs.ParkingLocation;

namespace SmartPark.Application.Interfaces;

public interface IParkingLocationService
{
    Task<IEnumerable<ParkingLocationDto>> GetAllAsync();
    Task<IEnumerable<ParkingLocationDto>> GetByCityAsync(string city);
    Task<ParkingLocationDto> GetByIdAsync(int id);
    Task<ParkingLocationDto> CreateAsync(CreateParkingLocationRequest request);
    Task<ParkingLocationDto> UpdateAsync(int id, UpdateParkingLocationRequest request);
    Task DeleteAsync(int id);
}
