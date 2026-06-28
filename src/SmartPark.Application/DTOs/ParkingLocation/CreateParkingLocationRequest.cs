namespace SmartPark.Application.DTOs.ParkingLocation;

public record CreateParkingLocationRequest(
    string LocationName,
    string Address,
    string City,
    int TotalSlots,
    double? Latitude = null,
    double? Longitude = null);
