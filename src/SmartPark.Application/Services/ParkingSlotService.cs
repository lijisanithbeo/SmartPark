using SmartPark.Application.DTOs.ParkingSlot;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Enums;
using SmartPark.Domain.Exceptions;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Application.Services;

public class ParkingSlotService : IParkingSlotService
{
    private readonly IUnitOfWork _uow;

    public ParkingSlotService(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<ParkingSlotDto>> GetByLocationAsync(int locationId)
    {
        var slots = await _uow.ParkingSlots.GetByLocationIdAsync(locationId);
        return slots.Select(ToDto);
    }

    public async Task<IEnumerable<ParkingSlotDto>> GetAvailableByLocationAsync(int locationId)
    {
        var slots = await _uow.ParkingSlots.GetAvailableSlotsByLocationAsync(locationId);
        return slots.Select(ToDto);
    }

    public async Task<ParkingSlotDto> GetByIdAsync(int id)
    {
        var slot = await _uow.ParkingSlots.GetByIdWithLocationAsync(id)
            ?? throw new DomainException($"Parking slot with ID {id} not found.");
        return ToDto(slot);
    }

    public async Task<ParkingSlotDto> CreateAsync(CreateParkingSlotRequest request, int callerId, bool isAdmin)
    {
        var location = await _uow.ParkingLocations.GetByIdAsync(request.LocationID)
            ?? throw new DomainException($"Parking location with ID {request.LocationID} not found.");

        if (!isAdmin && location.OwnerID != (int?)callerId)
            throw new ForbiddenException("You do not have permission to add slots to this location.");

        var existing = await _uow.ParkingSlots.GetByLocationIdAsync(request.LocationID);
        if (existing.Count() >= location.TotalSlots)
            throw new DomainException($"Cannot add more slots. This location has a maximum capacity of {location.TotalSlots}.");

        var slot = ParkingSlot.Create(
            request.LocationID,
            request.SlotNumber,
            request.FloorNumber,
            request.SlotType,
            request.HourlyRate);

        await _uow.ParkingSlots.AddAsync(slot);
        await _uow.SaveChangesAsync();
        return ToDto(slot);
    }

    public async Task<ParkingSlotDto> UpdateAsync(int id, UpdateParkingSlotRequest request, int callerId, bool isAdmin)
    {
        var slot = await _uow.ParkingSlots.GetByIdWithLocationAsync(id)
            ?? throw new DomainException($"Parking slot with ID {id} not found.");

        if (!isAdmin && slot.Location.OwnerID != (int?)callerId)
            throw new ForbiddenException("You do not have permission to update this slot.");

        slot.SlotNumber  = request.SlotNumber.Trim().ToUpper();
        slot.FloorNumber = request.FloorNumber;
        slot.SlotType    = request.SlotType;
        slot.Status      = request.Status;
        slot.ModifiedDate = DateTime.UtcNow;

        _uow.ParkingSlots.Update(slot);
        await _uow.SaveChangesAsync();
        return ToDto(slot);
    }

    public async Task DeleteAsync(int id, int callerId, bool isAdmin)
    {
        var slot = await _uow.ParkingSlots.GetByIdWithLocationAsync(id)
            ?? throw new DomainException($"Parking slot with ID {id} not found.");

        if (!isAdmin && slot.Location.OwnerID != (int?)callerId)
            throw new ForbiddenException("You do not have permission to delete this slot.");

        _uow.ParkingSlots.Delete(slot);
        await _uow.SaveChangesAsync();
    }

    private static ParkingSlotDto ToDto(ParkingSlot s)
    {
        string displayStatus;
        if (s.Status == SlotStatus.Maintenance)
        {
            displayStatus = "Maintenance";
        }
        else
        {
            var now = DateTime.UtcNow;
            var isOccupied = s.Reservations.Any(r =>
                r.Status != ReservationStatus.Cancelled &&
                r.StartTime <= now &&
                r.EndTime > now);
            displayStatus = isOccupied ? "Reserved" : "Available";
        }
        return new(s.ID, s.LocationID, s.Location?.LocationName ?? string.Empty,
            s.SlotNumber, s.FloorNumber, s.SlotType.ToString(), displayStatus, s.HourlyRate);
    }
}
