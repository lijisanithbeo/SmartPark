using SmartPark.Domain.Interfaces.Repositories;

namespace SmartPark.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IParkingLocationRepository ParkingLocations { get; }
    IParkingSlotRepository ParkingSlots { get; }
    IReservationRepository Reservations { get; }
    IPaymentRepository Payments { get; }
    IPricingConfigRepository PricingConfigs { get; }
    IAnalyticsRepository Analytics { get; }

    Task<int> SaveChangesAsync();
    Task<ITransaction> BeginTransactionAsync(System.Data.IsolationLevel level = System.Data.IsolationLevel.ReadCommitted);
}
