using SmartPark.Application.DTOs.Reservation;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Exceptions;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Application.Services;

public class ReservationService : IReservationService
{
    private readonly IUnitOfWork _uow;
    private readonly INotificationService _notifications;

    public ReservationService(IUnitOfWork uow, INotificationService notifications)
    {
        _uow = uow;
        _notifications = notifications;
    }

    public async Task<ReservationDto> CreateAsync(CreateReservationRequest request)
    {
        var slot = await _uow.ParkingSlots.GetByIdWithLocationAsync(request.SlotID)
            ?? throw new DomainException($"Parking slot with ID {request.SlotID} not found.");

        if (!slot.CanBeReserved)
            throw new DomainException($"Slot {slot.SlotNumber} is not available for reservation.");

        var isAvailable = await _uow.Reservations.IsSlotAvailableAsync(request.SlotID, request.StartTime, request.EndTime);
        if (!isAvailable)
            throw new DomainException("The slot already has an active reservation for the requested time.");

        // Compare raw local time (from frontend) against server local clock — before UTC kind is applied
        if (request.StartTime < DateTime.Now)
            throw new DomainException($"Start time must be in the future. Current time is {DateTime.Now:hh:mm tt}. Please select a later time.");

        var startUtc = DateTime.SpecifyKind(request.StartTime, DateTimeKind.Utc);
        var endUtc   = DateTime.SpecifyKind(request.EndTime,   DateTimeKind.Utc);
        var reservation = Reservation.Create(request.UserID, request.SlotID, startUtc, endUtc);

        slot.Reserve();
        await _uow.Reservations.AddAsync(reservation);
        _uow.ParkingSlots.Update(slot);
        await _uow.SaveChangesAsync();

        var location = await _uow.ParkingLocations.GetByIdAsync(slot.LocationID);
        return new ReservationDto(
            reservation.ID, reservation.UserID, reservation.SlotID,
            slot.SlotNumber,
            location?.LocationName ?? string.Empty,
            location?.Address      ?? string.Empty,
            location?.City         ?? string.Empty,
            reservation.ReservationDate, reservation.StartTime, reservation.EndTime,
            reservation.Status.ToString(), reservation.IsActive);
    }

    public async Task<ReservationDto> GetByIdAsync(int id)
    {
        var reservation = await _uow.Reservations.GetByIdAsync(id)
            ?? throw new DomainException($"Reservation with ID {id} not found.");
        return ToDto(reservation, reservation.ParkingSlot);
    }

    public async Task<IEnumerable<ReservationDto>> GetByUserAsync(int userId)
    {
        var reservations = await _uow.Reservations.GetByUserIdAsync(userId);
        return reservations.Select(r => ToDto(r, r.ParkingSlot));
    }

    public async Task<ReservationDto> CancelAsync(int id)
    {
        var reservation = await _uow.Reservations.GetByIdAsync(id)
            ?? throw new DomainException($"Reservation with ID {id} not found.");

        reservation.Cancel();

        var slot = await _uow.ParkingSlots.GetByIdAsync(reservation.SlotID);
        slot?.Release();

        if (slot != null) _uow.ParkingSlots.Update(slot);
        _uow.Reservations.Update(reservation);
        await _uow.SaveChangesAsync();

        await _notifications.SendReservationCancelledAsync(reservation.UserID, reservation.ID);
        return ToDto(reservation, reservation.ParkingSlot);
    }

    public async Task<ReservationDto> ConfirmAsync(int id)
    {
        var reservation = await _uow.Reservations.GetByIdAsync(id)
            ?? throw new DomainException($"Reservation with ID {id} not found.");

        reservation.Confirm();
        _uow.Reservations.Update(reservation);
        await _uow.SaveChangesAsync();

        await _notifications.SendReservationConfirmedAsync(reservation.UserID, reservation.ID);
        return ToDto(reservation, reservation.ParkingSlot);
    }

    private static ReservationDto ToDto(Reservation r, ParkingSlot? slot) =>
        new(r.ID, r.UserID, r.SlotID,
            slot?.SlotNumber ?? string.Empty,
            slot?.Location?.LocationName ?? string.Empty,
            slot?.Location?.Address      ?? string.Empty,
            slot?.Location?.City         ?? string.Empty,
            r.ReservationDate, r.StartTime, r.EndTime,
            r.Status.ToString(), r.IsActive);
}
