using SmartPark.Domain.Enums;

namespace SmartPark.Application.DTOs.User;

public record UserDto(
    int ID,
    string UserID,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    UserRole Role,
    DateTime CreatedDate,
    bool IsActive);
