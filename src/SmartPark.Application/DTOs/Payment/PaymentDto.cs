namespace SmartPark.Application.DTOs.Payment;

public record PaymentDto(
    int ID,
    int ReservationID,
    decimal Amount,
    string PaymentMethod,
    string TransactionID,
    string PaymentStatus,
    DateTime PaymentDate);
