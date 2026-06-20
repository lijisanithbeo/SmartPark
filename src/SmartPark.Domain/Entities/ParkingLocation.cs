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

    public ICollection<ParkingSlot> ParkingSlots { get; set; } = new List<ParkingSlot>();

    public static ParkingLocation Create(string locationName, string address, string city, int totalSlots)
    {
        if (string.IsNullOrWhiteSpace(locationName))
            throw new DomainException("Location name cannot be empty.");

        if (string.IsNullOrWhiteSpace(address))
            throw new DomainException("Address cannot be empty.");

        if (string.IsNullOrWhiteSpace(city))
            throw new DomainException("City cannot be empty.");

        if (totalSlots <= 0)
            throw new DomainException("Total slots must be greater than zero.");

        return new ParkingLocation
        {
            LocationName = locationName.Trim(),
            Address = address.Trim(),
            City = city.Trim(),
            TotalSlots = totalSlots,
            CreatedDate = DateTime.UtcNow,
            IsActive = true
        };
    }
}
