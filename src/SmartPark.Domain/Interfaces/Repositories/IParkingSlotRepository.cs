using SmartPark.Domain.Entities;
using SmartPark.Domain.Enums;

namespace SmartPark.Domain.Interfaces.Repositories;

public interface IParkingSlotRepository : IGenericRepository<ParkingSlot>
{
    Task<ParkingSlot?> GetByIdWithLocationAsync(int id);
    Task<IEnumerable<ParkingSlot>> GetByLocationIdAsync(int locationId);
    Task<IEnumerable<ParkingSlot>> GetAvailableSlotsByLocationAsync(int locationId);
    Task<int> GetAvailableSlotCountAsync(int locationId);
}
