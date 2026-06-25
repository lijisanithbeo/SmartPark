using Microsoft.EntityFrameworkCore;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Interfaces.Repositories;
using SmartPark.Infrastructure.Data;

namespace SmartPark.Infrastructure.Repositories;

public class PricingConfigRepository : BaseRepository<PricingConfig>, IPricingConfigRepository
{
    public PricingConfigRepository(SmartParkDbContext context) : base(context) { }

    public async Task<PricingConfig?> GetByLocationIdAsync(int locationId) =>
        await _dbSet.FirstOrDefaultAsync(p => p.LocationID == locationId);
}
