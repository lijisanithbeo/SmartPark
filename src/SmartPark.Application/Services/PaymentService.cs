using SmartPark.Application.DTOs.Payment;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Exceptions;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IUnitOfWork _uow;
    private readonly INotificationService _notifications;

    public PaymentService(IUnitOfWork uow, INotificationService notifications)
    {
        _uow = uow;
        _notifications = notifications;
    }

    public async Task<PaymentDto> CreateAsync(CreatePaymentRequest request)
    {
        var reservation = await _uow.Reservations.GetByIdAsync(request.ReservationID)
            ?? throw new DomainException($"Reservation with ID {request.ReservationID} not found.");

        if (!reservation.IsActive)
            throw new DomainException("Cannot create payment for a cancelled reservation.");

        var payment = new Payment
        {
            ReservationID = request.ReservationID,
            Amount = request.Amount,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = Domain.Enums.PaymentStatus.Pending,
            PaymentDate = DateTime.UtcNow
        };

        await _uow.Payments.AddAsync(payment);
        await _uow.SaveChangesAsync();
        return ToDto(payment);
    }

    public async Task<PaymentDto> GetByIdAsync(int id)
    {
        var payment = await _uow.Payments.GetByIdAsync(id)
            ?? throw new DomainException($"Payment with ID {id} not found.");
        return ToDto(payment);
    }

    public async Task<PaymentDto> GetByReservationAsync(int reservationId)
    {
        var payment = await _uow.Payments.GetByReservationIdAsync(reservationId)
            ?? throw new DomainException($"No payment found for reservation ID {reservationId}.");
        return ToDto(payment);
    }

    public async Task<PaymentDto> MarkSuccessAsync(int id)
    {
        var payment = await _uow.Payments.GetByIdAsync(id)
            ?? throw new DomainException($"Payment with ID {id} not found.");

        var reservation = await _uow.Reservations.GetByIdAsync(payment.ReservationID)
            ?? throw new DomainException($"Reservation not found for payment {id}.");

        // Attach so MarkSuccess() can call Reservation.Confirm() atomically
        payment.Reservation = reservation;
        payment.MarkSuccess();

        _uow.Payments.Update(payment);
        _uow.Reservations.Update(reservation);
        await _uow.SaveChangesAsync();

        await _notifications.SendPaymentSuccessAsync(reservation.UserID, payment.ID);
        return ToDto(payment);
    }

    public async Task<PaymentDto> MarkFailedAsync(int id)
    {
        var payment = await _uow.Payments.GetByIdAsync(id)
            ?? throw new DomainException($"Payment with ID {id} not found.");

        payment.MarkFailed();
        _uow.Payments.Update(payment);
        await _uow.SaveChangesAsync();
        return ToDto(payment);
    }

    public async Task<PaymentDto> PayReservationAsync(int reservationId, decimal amount, Domain.Enums.PaymentMethod method)
    {
        var reservation = await _uow.Reservations.GetByIdAsync(reservationId)
            ?? throw new DomainException($"Reservation {reservationId} not found.");

        if (!reservation.IsActive)
            throw new DomainException("Cannot pay for a cancelled reservation.");

        var payment = new Payment
        {
            ReservationID = reservationId,
            Amount        = amount,
            PaymentMethod = method,
            PaymentStatus = Domain.Enums.PaymentStatus.Pending,
            PaymentDate   = DateTime.UtcNow
        };

        if (method != Domain.Enums.PaymentMethod.Cash)
        {
            // Card / UPI — immediate payment: confirm reservation + mark payment Success
            payment.Reservation = reservation;
            payment.MarkSuccess();
            _uow.Reservations.Update(reservation);
            await _uow.Payments.AddAsync(payment);
            await _uow.SaveChangesAsync();
            await _notifications.SendPaymentSuccessAsync(reservation.UserID, payment.ID);
        }
        else
        {
            // Cash — pay at counter: leave reservation Pending, payment Pending
            await _uow.Payments.AddAsync(payment);
            await _uow.SaveChangesAsync();
        }

        return ToDto(payment);
    }

    private static PaymentDto ToDto(Payment p) =>
        new(p.ID, p.ReservationID, p.Amount,
            p.PaymentMethod.ToString(), p.TransactionID,
            p.PaymentStatus.ToString(), p.PaymentDate);
}
