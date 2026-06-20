using SmartPark.Domain.Enums;

namespace SmartPark.Application.DTOs.Auth;

public record RegisterRequest(
    string UserID,
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string PhoneNumber,
    UserRole Role);
