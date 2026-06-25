namespace SmartPark.Application.Interfaces;

public interface IRealtimeService
{
    Task NotifySlotStatusChangedAsync(int slotId, int locationId, string status);
    Task NotifyBookingCreatedAsync(int reservationId, int locationId, int? ownerId);
    Task NotifyBookingCancelledAsync(int reservationId, int locationId, int? ownerId);
    Task NotifyPaymentCompletedAsync(int paymentId, int reservationId, int? ownerId);
}
