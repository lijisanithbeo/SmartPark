using SmartPark.Domain.Enums;

namespace SmartPark.Application.DTOs.ParkingSlot;

public record CreateParkingSlotRequest(
    int LocationID,
    string SlotNumber,
    int FloorNumber,
    SlotType SlotType,
    decimal HourlyRate = 50m);
