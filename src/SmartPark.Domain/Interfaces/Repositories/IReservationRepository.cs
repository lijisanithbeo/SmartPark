using SmartPark.Domain.Entities;

namespace SmartPark.Domain.Interfaces.Repositories;

public interface IReservationRepository : IGenericRepository<Reservation>
{
    Task<IEnumerable<Reservation>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Reservation>> GetBySlotIdAsync(int slotId);
    Task<IEnumerable<Reservation>> GetByOwnerAsync(int ownerId);
    Task<IEnumerable<Reservation>> GetAllWithDetailsAsync();
    Task<Reservation?> GetByIdWithDetailsAsync(int id);
    Task<bool> IsSlotAvailableAsync(int slotId, DateTime startTime, DateTime endTime);
}
