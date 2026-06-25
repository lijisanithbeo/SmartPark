using SmartPark.Domain.Enums;
using SmartPark.Domain.Exceptions;

namespace SmartPark.Domain.Entities;

public class User
{
    public int ID { get; set; }
    public string UserID { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedDate { get; set; }
    public bool IsActive { get; set; }

    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<ParkingLocation> OwnedLocations { get; set; } = new List<ParkingLocation>();

    public static User Create(string userId, string firstName, string lastName, string email, string password, string phoneNumber, UserRole role)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new DomainException("UserID cannot be empty.");

        if (string.IsNullOrWhiteSpace(firstName))
            throw new DomainException("First name cannot be empty.");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new DomainException("Last name cannot be empty.");

        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("Email cannot be empty.");

        if (string.IsNullOrWhiteSpace(password))
            throw new DomainException("Password cannot be empty.");

        if (string.IsNullOrWhiteSpace(phoneNumber))
            throw new DomainException("Phone number cannot be empty.");

        return new User
        {
            UserID = userId.Trim(),
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            Email = email.Trim().ToLower(),
            Password = password,
            PhoneNumber = phoneNumber.Trim(),
            Role = role,
            CreatedDate = DateTime.UtcNow,
            IsActive = true
        };
    }
}
