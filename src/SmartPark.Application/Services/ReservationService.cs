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
    private readonly IRealtimeService _realtime;

    public ReservationService(IUnitOfWork uow, INotificationService notifications, IRealtimeService realtime)
    {
        _uow = uow;
        _notifications = notifications;
        _realtime = realtime;
    }

    public async Task<ReservationDto> CreateAsync(CreateReservationRequest request, int userId)
    {
        var slot = await _uow.ParkingSlots.GetByIdWithLocationAsync(request.SlotID)
            ?? throw new DomainException($"Parking slot with ID {request.SlotID} not found.");

        if (!slot.CanBeReserved)
            throw new DomainException($"Slot {slot.SlotNumber} is not available for reservation.");

        // Compare raw local time (from frontend) against server local clock — before UTC kind is applied
        if (request.StartTime < DateTime.Now)
            throw new DomainException($"Start time must be in the future. Current time is {DateTime.Now:hh:mm tt}. Please select a later time.");

        var startUtc = DateTime.SpecifyKind(request.StartTime, DateTimeKind.Utc);
        var endUtc   = DateTime.SpecifyKind(request.EndTime,   DateTimeKind.Utc);

        // Serializable transaction: availability check + insert are atomic — prevents double booking
        await using var tx = await _uow.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        var isAvailable = await _uow.Reservations.IsSlotAvailableAsync(request.SlotID, startUtc, endUtc);
        if (!isAvailable)
            throw new DomainException("The slot already has an active reservation for the requested time.");

        var reservation = Reservation.Create(userId, request.SlotID, startUtc, endUtc);
        if (!string.IsNullOrWhiteSpace(request.VehicleNumber))
            reservation.VehicleNumber = request.VehicleNumber.Trim().ToUpper();

        await _uow.Reservations.AddAsync(reservation);
        await _uow.SaveChangesAsync();
        await tx.CommitAsync();

        var location = await _uow.ParkingLocations.GetByIdAsync(slot.LocationID);

        await _realtime.NotifySlotStatusChangedAsync(slot.ID, slot.LocationID, "Reserved");
        await _realtime.NotifyBookingCreatedAsync(reservation.ID, slot.LocationID, location?.OwnerID);

        return new ReservationDto(
            reservation.ID, reservation.UserID, reservation.SlotID,
            slot.SlotNumber,
            location?.LocationName ?? string.Empty,
            location?.Address      ?? string.Empty,
            location?.City         ?? string.Empty,
            reservation.ReservationDate, reservation.StartTime, reservation.EndTime,
            reservation.Status.ToString(), reservation.IsActive, reservation.VehicleNumber,
            location?.Latitude, location?.Longitude);
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

    public async Task<IEnumerable<AdminReservationDto>> GetAllForAdminAsync()
    {
        var reservations = await _uow.Reservations.GetAllWithDetailsAsync();
        return reservations.Select(r => new AdminReservationDto(
            r.ID,
            r.UserID,
            $"{r.User?.FirstName} {r.User?.LastName}".Trim(),
            r.User?.Email ?? string.Empty,
            r.SlotID,
            r.ParkingSlot?.SlotNumber ?? string.Empty,
            r.ParkingSlot?.Location?.LocationName ?? string.Empty,
            r.ParkingSlot?.Location?.City ?? string.Empty,
            r.VehicleNumber,
            r.ReservationDate,
            r.StartTime,
            r.EndTime,
            r.Status.ToString(),
            r.Payment?.Amount,
            r.Payment?.PaymentStatus.ToString()));
    }

    public async Task<ReservationDto> CancelAsync(int id, int callerId, bool isAdmin)
    {
        var reservation = await _uow.Reservations.GetByIdAsync(id)
            ?? throw new DomainException($"Reservation with ID {id} not found.");

        if (!isAdmin && reservation.UserID != callerId)
            throw new ForbiddenException("You do not have permission to cancel this reservation.");

        // If the reservation was paid, mark it RefundPending so admin can process the refund
        var payment = await _uow.Payments.GetByReservationIdAsync(reservation.ID);
        if (payment?.PaymentStatus == Domain.Enums.PaymentStatus.Success)
        {
            payment.PaymentStatus = Domain.Enums.PaymentStatus.RefundPending;
            _uow.Payments.Update(payment);
        }

        reservation.Cancel();

        var slot = await _uow.ParkingSlots.GetByIdWithLocationAsync(reservation.SlotID);

        _uow.Reservations.Update(reservation);
        await _uow.SaveChangesAsync();

        await _notifications.SendReservationCancelledAsync(reservation.UserID, reservation.ID);

        if (slot != null)
        {
            await _realtime.NotifySlotStatusChangedAsync(slot.ID, slot.LocationID, "Available");
            await _realtime.NotifyBookingCancelledAsync(reservation.ID, slot.LocationID, slot.Location?.OwnerID);
        }

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
            r.Status.ToString(), r.IsActive, r.VehicleNumber,
            slot?.Location?.Latitude, slot?.Location?.Longitude);
}
