using SmartPark.Domain.Enums;

namespace SmartPark.Application.DTOs.ParkingSlot;

public record UpdateParkingSlotRequest(
    string SlotNumber,
    int FloorNumber,
    SlotType SlotType,
    SlotStatus Status);
