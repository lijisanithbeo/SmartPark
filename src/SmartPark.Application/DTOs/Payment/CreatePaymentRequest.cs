using SmartPark.Domain.Enums;

namespace SmartPark.Application.DTOs.Payment;

public record CreatePaymentRequest(
    int ReservationID,
    decimal Amount,
    PaymentMethod PaymentMethod);
