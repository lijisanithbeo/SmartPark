using SmartPark.Domain.Entities;
using SmartPark.Domain.Enums;

namespace SmartPark.Domain.Interfaces.Repositories;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task<IEnumerable<User>> GetByRoleAsync(UserRole role);
}
