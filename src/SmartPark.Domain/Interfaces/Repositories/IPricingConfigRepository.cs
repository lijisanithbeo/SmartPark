using SmartPark.Domain.Entities;

namespace SmartPark.Domain.Interfaces.Repositories;

public interface IPricingConfigRepository : IGenericRepository<PricingConfig>
{
    Task<PricingConfig?> GetByLocationIdAsync(int locationId);
}
