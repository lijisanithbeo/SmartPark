namespace SmartPark.Application.DTOs.ParkingLocation;

public record ParkingLocationDto(
    int ID,
    string LocationName,
    string Address,
    string City,
    int TotalSlots,
    int AvailableSlots,
    bool IsActive,
    int OwnerID,
    string OwnerName);
