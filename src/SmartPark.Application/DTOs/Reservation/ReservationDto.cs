namespace SmartPark.Application.DTOs.Reservation;

public record ReservationDto(
    int ID,
    int UserID,
    int SlotID,
    string SlotNumber,
    string LocationName,
    string LocationAddress,
    string LocationCity,
    DateTime ReservationDate,
    DateTime StartTime,
    DateTime EndTime,
    string Status,
    bool IsActive);
