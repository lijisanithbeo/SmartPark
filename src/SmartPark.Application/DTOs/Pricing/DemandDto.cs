namespace SmartPark.Application.DTOs.Pricing;

public record DemandDto(
    string DemandLevel,
    string DemandMessage,
    int AvailableSlots,
    int OccupiedSlots,
    int TotalSlots,
    double OccupancyRate,
    bool IsPeakActive,
    string PeakMessage
);
