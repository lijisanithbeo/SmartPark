namespace SmartPark.Application.DTOs.Pricing;

public record PriceEstimateDto(
    string PricingType,
    double DurationHours,
    decimal RateApplied,
    decimal TotalAmount,
    string BreakdownDescription,
    string DemandLevel,
    string DemandMessage,
    int AvailableSlots,
    int OccupiedSlots,
    bool IsPeakActive,
    string PeakMessage
);
