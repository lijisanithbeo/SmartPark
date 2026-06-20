using SmartPark.Application.DTOs.ParkingLocation;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Exceptions;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Application.Services;

public class ParkingLocationService : IParkingLocationService
{
    private readonly IUnitOfWork _uow;

    public ParkingLocationService(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<ParkingLocationDto>> GetAllAsync()
    {
        var locations = await _uow.ParkingLocations.GetActiveLocationsAsync();
        return locations.Select(ToDto);
    }

    public async Task<IEnumerable<ParkingLocationDto>> GetByCityAsync(string city)
    {
        var locations = await _uow.ParkingLocations.GetByCityAsync(city);
        return locations.Select(ToDto);
    }

    public async Task<ParkingLocationDto> GetByIdAsync(int id)
    {
        var location = await _uow.ParkingLocations.GetByIdAsync(id)
            ?? throw new DomainException($"Parking location with ID {id} not found.");
        return ToDto(location);
    }

    public async Task<ParkingLocationDto> CreateAsync(CreateParkingLocationRequest request)
    {
        var location = ParkingLocation.Create(
            request.LocationName,
            request.Address,
            request.City,
            request.TotalSlots);

        await _uow.ParkingLocations.AddAsync(location);
        await _uow.SaveChangesAsync();
        return ToDto(location);
    }

    public async Task<ParkingLocationDto> UpdateAsync(int id, UpdateParkingLocationRequest request)
    {
        var location = await _uow.ParkingLocations.GetByIdAsync(id)
            ?? throw new DomainException($"Parking location with ID {id} not found.");

        location.LocationName = request.LocationName.Trim();
        location.Address = request.Address.Trim();
        location.City = request.City.Trim();
        location.TotalSlots = request.TotalSlots;
        location.IsActive = request.IsActive;

        _uow.ParkingLocations.Update(location);
        await _uow.SaveChangesAsync();
        return ToDto(location);
    }

    public async Task DeleteAsync(int id)
    {
        var location = await _uow.ParkingLocations.GetByIdAsync(id)
            ?? throw new DomainException($"Parking location with ID {id} not found.");

        _uow.ParkingLocations.Delete(location);
        await _uow.SaveChangesAsync();
    }

    private static ParkingLocationDto ToDto(ParkingLocation l)
    {
        var available = l.ParkingSlots.Count(s => s.Status == Domain.Enums.SlotStatus.Available);
        return new ParkingLocationDto(l.ID, l.LocationName, l.Address, l.City, l.TotalSlots, available, l.IsActive);
    }
}
