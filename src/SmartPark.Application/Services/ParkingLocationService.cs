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

    // Public — all active locations (used by customer search and admin views)
    public async Task<IEnumerable<ParkingLocationDto>> GetAllAsync()
    {
        var locations = await _uow.ParkingLocations.GetActiveLocationsAsync();
        return locations.Select(ToDto);
    }

    // Admin — all locations regardless of IsActive
    public async Task<IEnumerable<ParkingLocationDto>> GetAllForAdminAsync()
    {
        var locations = await _uow.ParkingLocations.GetAllLocationsAsync();
        return locations.Select(ToDto);
    }

    public async Task<IEnumerable<ParkingLocationDto>> GetByCityAsync(string city)
    {
        var locations = await _uow.ParkingLocations.GetByCityAsync(city);
        return locations.Select(ToDto);
    }

    // Owner-scoped — returns only locations where OwnerID == ownerId
    public async Task<IEnumerable<ParkingLocationDto>> GetByOwnerAsync(int ownerId)
    {
        var locations = await _uow.ParkingLocations.GetByOwnerAsync(ownerId);
        return locations.Select(ToDto);
    }

    public async Task<ParkingLocationDto> GetByIdAsync(int id)
    {
        var location = await _uow.ParkingLocations.GetByIdAsync(id)
            ?? throw new DomainException($"Parking location with ID {id} not found.");
        return ToDto(location);
    }

    // ownerId always comes from the JWT claim — never from the request body
    public async Task<ParkingLocationDto> CreateAsync(CreateParkingLocationRequest request, int ownerId)
    {
        var location = ParkingLocation.Create(
            request.LocationName,
            request.Address,
            request.City,
            request.TotalSlots,
            ownerId);

        await _uow.ParkingLocations.AddAsync(location);
        await _uow.SaveChangesAsync();
        return ToDto(location);
    }

    public async Task<ParkingLocationDto> UpdateAsync(int id, UpdateParkingLocationRequest request, int callerId, bool isAdmin)
    {
        var location = await _uow.ParkingLocations.GetByIdAsync(id)
            ?? throw new DomainException($"Parking location with ID {id} not found.");

        if (!isAdmin && location.OwnerID != (int?)callerId)
            throw new ForbiddenException("You do not have permission to update this location.");

        location.LocationName = request.LocationName.Trim();
        location.Address      = request.Address.Trim();
        location.City         = request.City.Trim();
        location.TotalSlots   = request.TotalSlots;
        location.IsActive     = request.IsActive;
        if (isAdmin && request.OwnerID.HasValue && request.OwnerID.Value > 0)
            location.OwnerID = request.OwnerID.Value;

        _uow.ParkingLocations.Update(location);
        await _uow.SaveChangesAsync();
        return ToDto(location);
    }

    public async Task DeleteAsync(int id, int callerId, bool isAdmin)
    {
        var location = await _uow.ParkingLocations.GetByIdAsync(id)
            ?? throw new DomainException($"Parking location with ID {id} not found.");

        if (!isAdmin && location.OwnerID != (int?)callerId)
            throw new ForbiddenException("You do not have permission to delete this location.");

        _uow.ParkingLocations.Delete(location);
        await _uow.SaveChangesAsync();
    }

    private static ParkingLocationDto ToDto(ParkingLocation l)
    {
        var now = DateTime.UtcNow;
        var available = l.ParkingSlots.Count(s =>
            s.Status != Domain.Enums.SlotStatus.Maintenance &&
            !s.Reservations.Any(r =>
                r.Status != Domain.Enums.ReservationStatus.Cancelled &&
                r.StartTime <= now &&
                r.EndTime > now));
        var ownerName = l.Owner != null
            ? $"{l.Owner.FirstName} {l.Owner.LastName}".Trim()
            : string.Empty;
        return new ParkingLocationDto(l.ID, l.LocationName, l.Address, l.City, l.TotalSlots, available, l.IsActive, l.OwnerID ?? 0, ownerName);
    }
}
