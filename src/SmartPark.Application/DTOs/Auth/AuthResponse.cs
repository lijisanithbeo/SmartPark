using SmartPark.Domain.Enums;

namespace SmartPark.Application.DTOs.Auth;

public record AuthResponse(
    int ID,
    string Token,
    string UserID,
    string Email,
    UserRole Role,
    DateTime ExpiresAt);
