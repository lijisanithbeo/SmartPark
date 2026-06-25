using SmartPark.Application.DTOs.ParkingSlot;

namespace SmartPark.Application.Interfaces;

public interface IParkingSlotService
{
    Task<IEnumerable<ParkingSlotDto>> GetByLocationAsync(int locationId);
    Task<IEnumerable<ParkingSlotDto>> GetAvailableByLocationAsync(int locationId);
    Task<ParkingSlotDto> GetByIdAsync(int id);
    Task<ParkingSlotDto> CreateAsync(CreateParkingSlotRequest request, int callerId, bool isAdmin);
    Task<ParkingSlotDto> UpdateAsync(int id, UpdateParkingSlotRequest request, int callerId, bool isAdmin);
    Task DeleteAsync(int id, int callerId, bool isAdmin);
}
