using SmartPark.Domain.Interfaces.Repositories;

namespace SmartPark.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IParkingLocationRepository ParkingLocations { get; }
    IParkingSlotRepository ParkingSlots { get; }
    IReservationRepository Reservations { get; }
    IPaymentRepository Payments { get; }

    Task<int> SaveChangesAsync();
}
