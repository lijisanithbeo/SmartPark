namespace SmartPark.Application.DTOs.Payment;

public record AdminPaymentDto(
    int ID,
    int ReservationID,
    string CustomerName,
    string CustomerEmail,
    decimal Amount,
    string PaymentMethod,
    string TransactionID,
    string PaymentStatus,
    DateTime PaymentDate);
