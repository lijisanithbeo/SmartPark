using SmartPark.Application.Interfaces;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Infrastructure.Services;

// Push notification service — wire to Firebase/FCM in production
public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _uow;

    public NotificationService(IUnitOfWork uow) => _uow = uow;

    public async Task SendReservationConfirmedAsync(int userId, int reservationId)
    {
        var user = await _uow.Users.GetByIdAsync(userId);
        if (user is null) return;
        await SendAsync(user.Email, "Reservation Confirmed",
            $"Your reservation #{reservationId} has been confirmed.");
    }

    public async Task SendReservationCancelledAsync(int userId, int reservationId)
    {
        var user = await _uow.Users.GetByIdAsync(userId);
        if (user is null) return;
        await SendAsync(user.Email, "Reservation Cancelled",
            $"Your reservation #{reservationId} has been cancelled.");
    }

    public async Task SendReservationReminderAsync(int userId, int reservationId)
    {
        var user = await _uow.Users.GetByIdAsync(userId);
        if (user is null) return;
        await SendAsync(user.Email, "Reservation Reminder",
            $"Reminder: your reservation #{reservationId} is starting soon.");
    }

    public async Task SendPaymentSuccessAsync(int userId, int paymentId)
    {
        var user = await _uow.Users.GetByIdAsync(userId);
        if (user is null) return;
        await SendAsync(user.Email, "Payment Successful",
            $"Payment #{paymentId} was successful. Your slot is confirmed.");
    }

    private Task SendAsync(string email, string subject, string message)
    {
        // TODO: integrate Firebase Cloud Messaging or SMTP here
        Console.WriteLine($"[Notification] To: {email} | {subject}: {message}");
        return Task.CompletedTask;
    }
}
