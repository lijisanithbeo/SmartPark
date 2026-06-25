namespace SmartPark.Application.DTOs.Reservation;

public record CreateReservationRequest(
    int SlotID,
    DateTime StartTime,
    DateTime EndTime,
    string? VehicleNumber = null);
