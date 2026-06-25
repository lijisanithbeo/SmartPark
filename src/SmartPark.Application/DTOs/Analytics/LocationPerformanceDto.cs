namespace SmartPark.Application.DTOs.Analytics;

public class LocationPerformanceDto
{
    public int LocationId { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public int TotalSlots { get; set; }
    public int ReservationCount { get; set; }
    public decimal Revenue { get; set; }
    public double OccupancyPercent { get; set; }
}
