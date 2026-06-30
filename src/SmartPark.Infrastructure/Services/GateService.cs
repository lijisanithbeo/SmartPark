using SmartPark.Application.DTOs.Gate;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Exceptions;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Infrastructure.Services;

public class GateService : IGateService
{
    private readonly IUnitOfWork _uow;

    public GateService(IUnitOfWork uow) => _uow = uow;

    // Parse QR payload and return reservation details for display at the gate
    public async Task<GateScanResultDto> ScanAsync(string qrPayload)
    {
        var reservation = await GetReservationFromQr(qrPayload);
        var slot        = reservation.ParkingSlot;
        var location    = slot?.Location;
        var customer    = reservation.User;

        return new GateScanResultDto(
            reservation.ID,
            $"{customer?.FirstName} {customer?.LastName}".Trim(),
            slot?.SlotNumber       ?? string.Empty,
            location?.LocationName ?? string.Empty,
            location?.City         ?? string.Empty,
            reservation.StartTime,
            reservation.EndTime,
            reservation.Status.ToString(),
            reservation.VehicleNumber,
            reservation.IsCheckedIn,
            reservation.IsCheckedOut,
            reservation.CheckInTime,
            reservation.CheckOutTime,
            reservation.OverstayMinutes,
            reservation.OverstayPenalty,
            reservation.OverstayPaid
        );
    }

    public async Task<GateCheckInDto> CheckInAsync(string qrPayload)
    {
        var reservation = await GetReservationFromQr(qrPayload);

        if (reservation.Status == Domain.Enums.ReservationStatus.Cancelled)
            throw new DomainException("Cannot check in a cancelled reservation.");

        reservation.CheckIn(DateTime.UtcNow);
        _uow.Reservations.Update(reservation);
        await _uow.SaveChangesAsync();

        var slot     = reservation.ParkingSlot;
        var location = slot?.Location;
        var customer = reservation.User;

        return new GateCheckInDto(
            reservation.ID,
            reservation.CheckInTime!.Value,
            slot?.SlotNumber       ?? string.Empty,
            location?.LocationName ?? string.Empty,
            $"{customer?.FirstName} {customer?.LastName}".Trim(),
            "Vehicle checked in successfully."
        );
    }

    public async Task<GateCheckOutDto> CheckOutAsync(string qrPayload, bool overstayPaid)
    {
        var reservation = await GetReservationFromQr(qrPayload);

        reservation.CheckOut(DateTime.UtcNow);
        reservation.OverstayPaid = overstayPaid;

        _uow.Reservations.Update(reservation);
        await _uow.SaveChangesAsync();

        bool hasOverstay = reservation.OverstayPenalty > 0;
        string message = hasOverstay
            ? $"Vehicle checked out. Overstay: {reservation.OverstayMinutes} min — Penalty: ₹{reservation.OverstayPenalty:F0}{(overstayPaid ? " (Paid)" : " (Unpaid)")}."
            : "Vehicle checked out successfully. No overstay.";

        return new GateCheckOutDto(
            reservation.ID,
            reservation.CheckOutTime!.Value,
            reservation.OverstayMinutes,
            reservation.OverstayPenalty,
            reservation.OverstayPaid,
            hasOverstay,
            message
        );
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private async Task<Domain.Entities.Reservation> GetReservationFromQr(string qrPayload)
    {
        var reservationId = ParseReservationId(qrPayload);
        var reservation   = await _uow.Reservations.GetByIdWithDetailsAsync(reservationId)
            ?? throw new DomainException($"Reservation {reservationId} not found.");
        return reservation;
    }

    private static int ParseReservationId(string qrPayload)
    {
        if (string.IsNullOrWhiteSpace(qrPayload))
            throw new DomainException("QR payload is empty.");

        // Format: SMARTPARK|RES:{id}|SLOT:{slotId}|{time}
        var parts = qrPayload.Trim().Split('|');
        if (parts.Length >= 2 && parts[0] == "SMARTPARK")
        {
            var resPart = parts[1]; // "RES:123"
            if (resPart.StartsWith("RES:") && int.TryParse(resPart[4..], out var id))
                return id;
        }

        // Also accept a plain reservation ID entered manually
        if (int.TryParse(qrPayload.Trim(), out var plainId))
            return plainId;

        throw new DomainException("Invalid QR code. Cannot read reservation ID.");
    }
}
