namespace SmartPark.Application.DTOs.Analytics;

public class PeakDayDto
{
    public int DayOfWeek { get; set; }     // 0=Sunday … 6=Saturday
    public string DayName { get; set; } = string.Empty;
    public int BookingCount { get; set; }
}
