namespace SmartPark.Application.DTOs.Analytics;

public class PeakHourDto
{
    public int Hour { get; set; }          // 0–23
    public string HourLabel { get; set; } = string.Empty; // "12 AM", "1 PM"
    public int BookingCount { get; set; }
}
