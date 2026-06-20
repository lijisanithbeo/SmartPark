using SmartPark.Application.DTOs.ParkingSlot;

namespace SmartPark.Application.Interfaces;

public interface IParkingSlotService
{
    Task<IEnumerable<ParkingSlotDto>> GetByLocationAsync(int locationId);
    Task<IEnumerable<ParkingSlotDto>> GetAvailableByLocationAsync(int locationId);
    Task<ParkingSlotDto> GetByIdAsync(int id);
    Task<ParkingSlotDto> CreateAsync(CreateParkingSlotRequest request);
    Task<ParkingSlotDto> UpdateAsync(int id, UpdateParkingSlotRequest request);
    Task DeleteAsync(int id);
}
