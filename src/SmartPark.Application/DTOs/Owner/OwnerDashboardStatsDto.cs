namespace SmartPark.Application.DTOs.Owner;

public class OwnerDashboardStatsDto
{
    public int TotalLocations { get; set; }
    public int TotalSlots { get; set; }
    public int AvailableSlots { get; set; }
    public int OccupiedSlots { get; set; }
    public int ActiveReservations { get; set; }
    public int TodayReservations { get; set; }
    public decimal TodayRevenue { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal TotalRevenue { get; set; }
}
