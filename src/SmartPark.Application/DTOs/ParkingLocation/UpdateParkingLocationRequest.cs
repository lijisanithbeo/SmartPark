namespace SmartPark.Application.DTOs.ParkingLocation;

public record UpdateParkingLocationRequest(
    string LocationName,
    string Address,
    string City,
    int TotalSlots,
    bool IsActive);
