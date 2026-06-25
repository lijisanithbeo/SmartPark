using SmartPark.Application.DTOs.User;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Enums;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Application.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _uow;
    public UserService(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _uow.Users.GetAllAsync();
        return users.Select(ToDto);
    }

    public async Task<IEnumerable<UserDto>> GetByRoleAsync(UserRole role)
    {
        var users = await _uow.Users.GetByRoleAsync(role);
        return users.Select(ToDto);
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _uow.Users.GetByIdAsync(id);
        return user is null ? null : ToDto(user);
    }

    public async Task<bool> ToggleActiveAsync(int id)
    {
        var user = await _uow.Users.GetByIdAsync(id)
            ?? throw new Domain.Exceptions.DomainException("User not found.");
        user.IsActive = !user.IsActive;
        _uow.Users.Update(user);
        await _uow.SaveChangesAsync();
        return user.IsActive;
    }

    public async Task<UserDto?> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await _uow.Users.GetByIdAsync(id)
            ?? throw new Domain.Exceptions.DomainException("User not found.");

        var normalizedEmail = request.Email.Trim().ToLower();
        if (user.Email != normalizedEmail && await _uow.Users.EmailExistsAsync(normalizedEmail))
            throw new Domain.Exceptions.DomainException("Email is already in use by another account.");

        user.FirstName   = request.FirstName.Trim();
        user.LastName    = request.LastName.Trim();
        user.Email       = normalizedEmail;
        user.PhoneNumber = request.PhoneNumber.Trim();

        _uow.Users.Update(user);
        await _uow.SaveChangesAsync();
        return ToDto(user);
    }

    private static UserDto ToDto(Domain.Entities.User u) =>
        new(u.ID, u.UserID, u.FirstName, u.LastName, u.Email, u.PhoneNumber, u.Role, u.CreatedDate, u.IsActive);
}
