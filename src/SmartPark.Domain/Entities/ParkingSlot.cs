using SmartPark.Domain.Enums;
using SmartPark.Domain.Exceptions;

namespace SmartPark.Domain.Entities;

public class ParkingSlot
{
    public int ID { get; set; }
    public int LocationID { get; set; }
    public string SlotNumber { get; set; } = string.Empty;
    public int FloorNumber { get; set; }
    public SlotType SlotType { get; set; }
    public SlotStatus Status { get; set; }
    public decimal HourlyRate { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }

    public ParkingLocation Location { get; set; } = null!;
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

    // Rule: Slots under Maintenance cannot be reserved; availability is determined by time overlap, not this flag
    public bool CanBeReserved => Status != SlotStatus.Maintenance;

    // Rule: One active reservation at a time — derived from Reservations collection
    public bool HasActiveReservation =>
        Reservations.Any(r => r.Status == ReservationStatus.Confirmed || r.Status == ReservationStatus.Pending);

    // Factory method — enforces creation rules
    // Note: SlotNumber uniqueness within a location is enforced at the repository/service layer
    public static ParkingSlot Create(int locationId, string slotNumber, int floorNumber, SlotType slotType, decimal hourlyRate = 50m)
    {
        // Rule: SlotNumber cannot be empty
        if (string.IsNullOrWhiteSpace(slotNumber))
            throw new DomainException("Slot number cannot be empty.");

        // Rule: Floor number must be 0 or greater
        if (floorNumber < 0)
            throw new DomainException("Floor number must be 0 or greater.");

        if (locationId <= 0)
            throw new DomainException("Slot must belong to a valid parking location.");

        if (hourlyRate <= 0)
            throw new DomainException("Hourly rate must be greater than zero.");

        return new ParkingSlot
        {
            LocationID  = locationId,
            SlotNumber  = slotNumber.Trim().ToUpper(),
            FloorNumber = floorNumber,
            SlotType    = slotType,
            HourlyRate  = hourlyRate,
            Status      = SlotStatus.Available,
            CreatedDate = DateTime.UtcNow
        };
    }

    // Rule: Only Available slot can be reserved
    public void Reserve()
    {
        if (!CanBeReserved)
            throw new DomainException($"Slot {SlotNumber} is not available for reservation. Current status: {Status}.");

        Status = SlotStatus.Reserved;
        ModifiedDate = DateTime.UtcNow;
    }

    public void Release()
    {
        Status = SlotStatus.Available;
        ModifiedDate = DateTime.UtcNow;
    }

    public void SetMaintenance()
    {
        Status = SlotStatus.Maintenance;
        ModifiedDate = DateTime.UtcNow;
    }
}
