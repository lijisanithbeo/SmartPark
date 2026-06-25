namespace SmartPark.Application.Interfaces;

public interface IPasswordResetService
{
    Task SendResetEmailAsync(string email);
    Task<bool> ResetPasswordAsync(string token, string newPassword);
}
