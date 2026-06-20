using SmartPark.Domain.Enums;
using SmartPark.Domain.Exceptions;

namespace SmartPark.Domain.Entities;

public class Payment
{
    public int ID { get; set; }
    public int ReservationID { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string TransactionID { get; set; } = string.Empty;
    public PaymentStatus PaymentStatus { get; set; }
    public DateTime PaymentDate { get; set; }

    public Reservation Reservation { get; set; } = null!;

    // Rule: Only a successful payment confirms the reservation
    public void MarkSuccess()
    {
        if (PaymentStatus == PaymentStatus.Success)
            throw new DomainException("Payment is already marked as successful.");

        PaymentStatus = PaymentStatus.Success;
        PaymentDate = DateTime.UtcNow;

        // Confirm the linked reservation only on successful payment
        if (Reservation is null)
            throw new DomainException("Payment must be linked to a reservation.");

        Reservation.Confirm();
    }

    public void MarkFailed()
    {
        if (PaymentStatus == PaymentStatus.Success)
            throw new DomainException("A successful payment cannot be marked as failed.");

        PaymentStatus = PaymentStatus.Failed;
    }
}
