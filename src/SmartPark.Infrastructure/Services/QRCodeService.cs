using QRCoder;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Exceptions;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Infrastructure.Services;

public class QRCodeService : IQRCodeService
{
    private readonly IUnitOfWork _uow;

    public QRCodeService(IUnitOfWork uow) => _uow = uow;

    public async Task<string> GenerateAsync(int reservationId)
    {
        var reservation = await _uow.Reservations.GetByIdAsync(reservationId)
            ?? throw new DomainException($"Reservation {reservationId} not found.");

        if (!reservation.IsActive)
            throw new DomainException("Cannot generate QR code for a cancelled reservation.");

        var payload = $"SMARTPARK|RES:{reservationId}|SLOT:{reservation.SlotID}|{reservation.StartTime:yyyyMMddHHmm}";

        using var qrGenerator = new QRCodeGenerator();
        var qrData = qrGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrData);
        var bytes = qrCode.GetGraphic(10);
        return Convert.ToBase64String(bytes);
    }

    public async Task<bool> ValidateAsync(string qrToken)
    {
        if (string.IsNullOrWhiteSpace(qrToken)) return false;

        // Parse: SMARTPARK|RES:{id}|SLOT:{slotId}|{time}
        var parts = qrToken.Split('|');
        if (parts.Length < 3 || parts[0] != "SMARTPARK") return false;

        if (!int.TryParse(parts[1].Replace("RES:", ""), out var reservationId)) return false;

        var reservation = await _uow.Reservations.GetByIdAsync(reservationId);
        return reservation is { } r && r.IsActive &&
               r.StartTime <= DateTime.UtcNow && r.EndTime >= DateTime.UtcNow;
    }
}
