using SmartPark.Domain.Enums;
using SmartPark.Domain.Exceptions;

namespace SmartPark.Domain.Entities;

public class Reservation
{
    // Rule 7: Duration limits
    public const int MinDurationMinutes = 30;
    public const int MaxDurationHours = 24;

    public int ID { get; set; }
    public int UserID { get; set; }
    public int SlotID { get; set; }
    public DateTime ReservationDate { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public ReservationStatus Status { get; set; }
    public string? VehicleNumber { get; set; }

    // Rule 6: Cancelled reservation is not an active booking
    public bool IsActive => Status != ReservationStatus.Cancelled;

    public User User { get; set; } = null!;
    public ParkingSlot ParkingSlot { get; set; } = null!;
    public Payment? Payment { get; set; }

    // Factory method — enforces all domain rules at creation time
    public static Reservation Create(int userId, int slotId, DateTime startTime, DateTime endTime)
    {
        // Rule 4: Must belong to a valid user
        if (userId <= 0)
            throw new DomainException("Reservation must belong to a valid user.");

        // Rule 5: Must reference a valid parking slot
        if (slotId <= 0)
            throw new DomainException("Reservation must reference a valid parking slot.");


        if (endTime <= startTime)
            throw new DomainException("End time must be after start time.");

        // Rule 7: Duration must be within allowed limits
        var duration = endTime - startTime;
        if (duration.TotalMinutes < MinDurationMinutes)
            throw new DomainException($"Reservation duration must be at least {MinDurationMinutes} minutes.");

        if (duration.TotalHours > MaxDurationHours)
            throw new DomainException($"Reservation duration cannot exceed {MaxDurationHours} hours.");

        return new Reservation
        {
            UserID = userId,
            SlotID = slotId,
            StartTime = startTime,
            EndTime = endTime,
            ReservationDate = DateTime.UtcNow,
            Status = ReservationStatus.Pending
        };
    }

    // Rule 6: Cancelled reservation cannot be reused or cancelled again
    public void Cancel()
    {
        if (Status == ReservationStatus.Cancelled)
            throw new DomainException("Reservation is already cancelled.");

        Status = ReservationStatus.Cancelled;
    }

    public void Confirm()
    {
        if (Status != ReservationStatus.Pending)
            throw new DomainException("Only pending reservations can be confirmed.");

        Status = ReservationStatus.Confirmed;
    }
}
