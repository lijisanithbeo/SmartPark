namespace SmartPark.Application.DTOs.ParkingSlot;

public record ParkingSlotDto(
    int ID,
    int LocationID,
    string LocationName,
    string SlotNumber,
    int FloorNumber,
    string SlotType,
    string Status,
    decimal HourlyRate);
