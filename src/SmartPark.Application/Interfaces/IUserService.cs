using SmartPark.Application.DTOs.User;
using SmartPark.Domain.Enums;

namespace SmartPark.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<IEnumerable<UserDto>> GetByRoleAsync(UserRole role);
    Task<UserDto?> GetByIdAsync(int id);
    Task<bool> ToggleActiveAsync(int id);
    Task<UserDto?> UpdateAsync(int id, UpdateUserRequest request);
}
