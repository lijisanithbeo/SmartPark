using SmartPark.Domain.Entities;

namespace SmartPark.Domain.Interfaces.Repositories;

public interface IPaymentRepository : IGenericRepository<Payment>
{
    Task<Payment?> GetByReservationIdAsync(int reservationId);
    Task<IEnumerable<Payment>> GetByUserIdAsync(int userId);
}
