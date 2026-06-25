namespace SmartPark.Application.DTOs.Reservation;

public record AdminReservationDto(
    int ID,
    int UserID,
    string CustomerName,
    string CustomerEmail,
    int SlotID,
    string SlotNumber,
    string LocationName,
    string LocationCity,
    string? VehicleNumber,
    DateTime ReservationDate,
    DateTime StartTime,
    DateTime EndTime,
    string Status,
    decimal? Amount,
    string? PaymentStatus);
