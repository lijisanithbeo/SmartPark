using SmartPark.Application.DTOs.Auth;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Enums;
using SmartPark.Domain.Exceptions;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokenService;

    public AuthService(IUnitOfWork uow, IPasswordHasher hasher, ITokenService tokenService)
    {
        _uow = uow;
        _hasher = hasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _uow.Users.EmailExistsAsync(request.Email))
            throw new DomainException("A user with this email already exists.");

        var user = User.Create(
            request.UserID,
            request.FirstName,
            request.LastName,
            request.Email,
            _hasher.Hash(request.Password),
            request.PhoneNumber,
            UserRole.Customer);

        await _uow.Users.AddAsync(user);
        await _uow.SaveChangesAsync();

        return new AuthResponse(
            user.ID,
            _tokenService.GenerateToken(user),
            user.UserID,
            user.FirstName,
            user.LastName,
            user.Email,
            user.Role,
            _tokenService.GetExpiry());
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _uow.Users.GetByEmailAsync(request.Email)
            ?? throw new DomainException("Invalid email or password.");

        if (!user.IsActive)
            throw new DomainException("Account is inactive.");

        if (!_hasher.Verify(request.Password, user.Password))
            throw new DomainException("Invalid email or password.");

        return new AuthResponse(
            user.ID,
            _tokenService.GenerateToken(user),
            user.UserID,
            user.FirstName,
            user.LastName,
            user.Email,
            user.Role,
            _tokenService.GetExpiry());
    }
}
