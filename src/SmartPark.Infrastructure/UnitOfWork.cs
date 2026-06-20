using SmartPark.Domain.Interfaces;
using SmartPark.Domain.Interfaces.Repositories;
using SmartPark.Infrastructure.Data;
using SmartPark.Infrastructure.Repositories;

namespace SmartPark.Infrastructure;

public class UnitOfWork : IUnitOfWork
{
    private readonly SmartParkDbContext _context;

    public IUserRepository Users { get; }
    public IParkingLocationRepository ParkingLocations { get; }
    public IParkingSlotRepository ParkingSlots { get; }
    public IReservationRepository Reservations { get; }
    public IPaymentRepository Payments { get; }

    public UnitOfWork(SmartParkDbContext context)
    {
        _context = context;
        Users = new UserRepository(context);
        ParkingLocations = new ParkingLocationRepository(context);
        ParkingSlots = new ParkingSlotRepository(context);
        Reservations = new ReservationRepository(context);
        Payments = new PaymentRepository(context);
    }

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    public void Dispose() => _context.Dispose();
}
