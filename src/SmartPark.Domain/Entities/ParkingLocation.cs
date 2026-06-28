using SmartPark.Domain.Exceptions;

namespace SmartPark.Domain.Entities;

public class ParkingLocation
{
    public int ID { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public int TotalSlots { get; set; }
    public DateTime CreatedDate { get; set; }
    public bool IsActive { get; set; }

    // Multi-tenant: every location belongs to one Parking Owner (nullable for migration compatibility)
    // GPS coordinates — nullable so existing rows migrate without breaking.
    // When set, the frontend uses these directly as the Maps destination
    // instead of geocoding the text address (more accurate for local parking lots).
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // Multi-tenant: every location belongs to one Parking Owner (nullable for migration compatibility)
    public int? OwnerID { get; set; }
    public User? Owner { get; set; }

    public ICollection<ParkingSlot> ParkingSlots { get; set; } = new List<ParkingSlot>();

    public static ParkingLocation Create(string locationName, string address, string city, int totalSlots, int ownerId)
    {
        if (string.IsNullOrWhiteSpace(locationName))
            throw new DomainException("Location name cannot be empty.");

        if (string.IsNullOrWhiteSpace(address))
            throw new DomainException("Address cannot be empty.");

        if (string.IsNullOrWhiteSpace(city))
            throw new DomainException("City cannot be empty.");

        if (totalSlots <= 0)
            throw new DomainException("Total slots must be greater than zero.");

        if (ownerId <= 0)
            throw new DomainException("Location must belong to a valid owner.");

        return new ParkingLocation
        {
            LocationName = locationName.Trim(),
            Address      = address.Trim(),
            City         = city.Trim(),
            TotalSlots   = totalSlots,
            OwnerID      = ownerId,
            CreatedDate  = DateTime.UtcNow,
            IsActive     = true
        };
    }
}
