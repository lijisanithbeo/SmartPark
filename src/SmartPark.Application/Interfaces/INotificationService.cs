namespace SmartPark.Application.Interfaces;

public interface INotificationService
{
    Task SendReservationConfirmedAsync(int userId, int reservationId);
    Task SendReservationCancelledAsync(int userId, int reservationId);
    Task SendReservationReminderAsync(int userId, int reservationId);
    Task SendPaymentSuccessAsync(int userId, int paymentId);
}
