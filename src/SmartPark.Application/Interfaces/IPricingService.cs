using SmartPark.Application.DTOs.Pricing;

namespace SmartPark.Application.Interfaces;

public interface IPricingService
{
    Task<PriceEstimateDto> EstimatePriceAsync(int slotId, DateTime startTime, DateTime endTime);
    Task<decimal> CalculateAmountAsync(int slotId, DateTime startTime, DateTime endTime);
    Task<DemandDto> GetDemandAsync(int locationId);
    Task<PricingConfigDto> GetConfigAsync(int locationId);
    Task<PricingConfigDto> SaveConfigAsync(int locationId, SavePricingConfigRequest request);
}
