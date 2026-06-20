namespace SmartPark.Application.DTOs.Reservation;

public record CreateReservationRequest(
    int UserID,
    int SlotID,
    DateTime StartTime,
    DateTime EndTime);
