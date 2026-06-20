using SmartPark.Application.DTOs.ParkingSlot;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Entities;
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

    public async Task<ParkingSlotDto> CreateAsync(CreateParkingSlotRequest request)
    {
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

    public async Task<ParkingSlotDto> UpdateAsync(int id, UpdateParkingSlotRequest request)
    {
        var slot = await _uow.ParkingSlots.GetByIdAsync(id)
            ?? throw new DomainException($"Parking slot with ID {id} not found.");

        slot.SlotNumber = request.SlotNumber.Trim().ToUpper();
        slot.FloorNumber = request.FloorNumber;
        slot.SlotType = request.SlotType;
        slot.Status = request.Status;
        slot.ModifiedDate = DateTime.UtcNow;

        _uow.ParkingSlots.Update(slot);
        await _uow.SaveChangesAsync();
        return ToDto(slot);
    }

    public async Task DeleteAsync(int id)
    {
        var slot = await _uow.ParkingSlots.GetByIdAsync(id)
            ?? throw new DomainException($"Parking slot with ID {id} not found.");

        _uow.ParkingSlots.Delete(slot);
        await _uow.SaveChangesAsync();
    }

    private static ParkingSlotDto ToDto(ParkingSlot s) =>
        new(s.ID, s.LocationID, s.Location?.LocationName ?? string.Empty,
            s.SlotNumber, s.FloorNumber, s.SlotType.ToString(), s.Status.ToString(), s.HourlyRate);
}
