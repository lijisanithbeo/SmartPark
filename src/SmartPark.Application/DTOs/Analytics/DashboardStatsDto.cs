namespace SmartPark.Application.DTOs.Analytics;

public class DashboardStatsDto
{
    public int TotalSlots { get; set; }
    public int AvailableSlots { get; set; }
    public int OccupiedSlots { get; set; }
    public int MaintenanceSlots { get; set; }
    public int TodayReservations { get; set; }
    public int TotalReservations { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TodayRevenue { get; set; }
    public int ActiveReservations { get; set; }
    public int TotalLocations { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalPayments { get; set; }
}
