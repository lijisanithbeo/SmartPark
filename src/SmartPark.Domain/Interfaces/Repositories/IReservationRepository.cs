using SmartPark.Domain.Entities;

namespace SmartPark.Domain.Interfaces.Repositories;

public interface IReservationRepository : IGenericRepository<Reservation>
{
    Task<IEnumerable<Reservation>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Reservation>> GetBySlotIdAsync(int slotId);
    Task<bool> IsSlotAvailableAsync(int slotId, DateTime startTime, DateTime endTime);
}
