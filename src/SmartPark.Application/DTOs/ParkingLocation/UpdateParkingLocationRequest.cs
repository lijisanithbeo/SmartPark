namespace SmartPark.Application.DTOs.ParkingLocation;

public record UpdateParkingLocationRequest(
    string LocationName,
    string Address,
    string City,
    int TotalSlots,
    bool IsActive,
    int? OwnerID = null,
    double? Latitude = null,
    double? Longitude = null);
