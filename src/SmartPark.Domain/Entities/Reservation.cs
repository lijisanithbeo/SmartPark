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

    // Gate check-in / check-out tracking
    public DateTime? CheckInTime     { get; set; }
    public DateTime? CheckOutTime    { get; set; }
    public int       OverstayMinutes { get; set; }
    public decimal   OverstayPenalty { get; set; }
    public bool      OverstayPaid    { get; set; }

    // Rule 6: Cancelled reservation is not an active booking
    public bool IsActive     => Status != ReservationStatus.Cancelled;
    public bool IsCheckedIn  => CheckInTime.HasValue && !CheckOutTime.HasValue;
    public bool IsCheckedOut => CheckOutTime.HasValue;

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

    public void CheckIn(DateTime checkInTime)
    {
        if (Status == ReservationStatus.Cancelled)
            throw new DomainException("Cannot check in a cancelled reservation.");
        if (CheckInTime.HasValue)
            throw new DomainException("Vehicle has already checked in.");

        CheckInTime = checkInTime;
    }

    // gracePeriodMinutes: free overstay buffer (default 15)
    // blockMinutes: billing interval (default 15)
    // penaltyPerBlock: charge per block (default ₹20)
    public void CheckOut(DateTime checkOutTime, int gracePeriodMinutes = 15, int blockMinutes = 15, decimal penaltyPerBlock = 20m)
    {
        if (!CheckInTime.HasValue)
            throw new DomainException("Vehicle has not checked in yet.");
        if (CheckOutTime.HasValue)
            throw new DomainException("Vehicle has already checked out.");

        CheckOutTime = checkOutTime;

        var overstayRaw = (checkOutTime - EndTime).TotalMinutes - gracePeriodMinutes;
        if (overstayRaw > 0)
        {
            OverstayMinutes = (int)Math.Ceiling(overstayRaw);
            var blocks = (int)Math.Ceiling(overstayRaw / blockMinutes);
            OverstayPenalty = blocks * penaltyPerBlock;
        }
    }
}
