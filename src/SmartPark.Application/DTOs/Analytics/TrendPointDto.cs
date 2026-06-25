namespace SmartPark.Application.DTOs.Analytics;

public class TrendPointDto
{
    public string Date { get; set; } = string.Empty;   // "Jun 01"
    public int ReservationCount { get; set; }
    public decimal Revenue { get; set; }
    public double OccupancyPercent { get; set; }
}
