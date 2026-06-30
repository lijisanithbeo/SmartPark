namespace SmartPark.Application.DTOs.Owner;

public class OwnerReservationDto
{
    public int ReservationID { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string SlotNumber { get; set; } = string.Empty;
    public string LocationName { get; set; } = string.Empty;
    public DateTime BookingTime { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public int     OverstayMinutes { get; set; }
    public decimal OverstayPenalty { get; set; }
    public bool    OverstayPaid    { get; set; }
}
