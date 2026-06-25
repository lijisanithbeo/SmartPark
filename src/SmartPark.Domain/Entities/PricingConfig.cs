namespace SmartPark.Domain.Entities;

public class PricingConfig
{
    public int ID { get; set; }
    public int LocationID { get; set; }
    public ParkingLocation? Location { get; set; }

    public decimal NormalRate { get; set; }

    public bool WeekdayPeakEnabled { get; set; }
    public int WeekdayPeakStartHour { get; set; }
    public int WeekdayPeakEndHour { get; set; }
    public decimal WeekdayPeakRate { get; set; }

    public bool WeekendPeakEnabled { get; set; }
    public int WeekendPeakStartHour { get; set; }
    public int WeekendPeakEndHour { get; set; }
    public decimal WeekendPeakRate { get; set; }
}
