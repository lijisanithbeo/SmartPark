namespace SmartPark.Application.DTOs.Pricing;

public record SavePricingConfigRequest(
    decimal NormalRate,
    bool WeekdayPeakEnabled,
    int WeekdayPeakStartHour,
    int WeekdayPeakEndHour,
    decimal WeekdayPeakRate,
    bool WeekendPeakEnabled,
    int WeekendPeakStartHour,
    int WeekendPeakEndHour,
    decimal WeekendPeakRate
);
