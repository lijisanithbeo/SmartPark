using SmartPark.Domain.Entities;

namespace SmartPark.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
    DateTime GetExpiry();
}
