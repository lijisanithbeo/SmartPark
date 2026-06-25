using Microsoft.EntityFrameworkCore;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Interfaces.Repositories;
using SmartPark.Infrastructure.Data;

namespace SmartPark.Infrastructure.Repositories;

public class PaymentRepository : BaseRepository<Payment>, IPaymentRepository
{
    public PaymentRepository(SmartParkDbContext context) : base(context) { }

    public async Task<Payment?> GetByReservationIdAsync(int reservationId) =>
        await _dbSet.Include(p => p.Reservation)
                    .FirstOrDefaultAsync(p => p.ReservationID == reservationId);

    public async Task<IEnumerable<Payment>> GetByUserIdAsync(int userId) =>
        await _dbSet.Include(p => p.Reservation)
                    .Where(p => p.Reservation.UserID == userId)
                    .ToListAsync();

    public async Task<IEnumerable<Payment>> GetAllWithDetailsAsync() =>
        await _dbSet.Include(p => p.Reservation).ThenInclude(r => r.User)
                    .OrderByDescending(p => p.PaymentDate)
                    .ToListAsync();
}
