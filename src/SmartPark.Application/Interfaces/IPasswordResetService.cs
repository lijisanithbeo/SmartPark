namespace SmartPark.Application.Interfaces;

public interface IPasswordResetService
{
    Task<string?> GenerateResetLinkAsync(string email);
    Task<bool> ResetPasswordAsync(string token, string newPassword);
}
