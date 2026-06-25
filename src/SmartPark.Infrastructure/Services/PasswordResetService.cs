using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Interfaces;
using SmartPark.Infrastructure.Data;
using SmartPark.Infrastructure.Options;

namespace SmartPark.Infrastructure.Services;

public class PasswordResetService : IPasswordResetService
{
    private readonly SmartParkDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IPasswordHasher _hasher;
    private readonly AppOptions _appOptions;

    public PasswordResetService(
        SmartParkDbContext context,
        IEmailService emailService,
        IPasswordHasher hasher,
        IOptions<AppOptions> appOptions)
    {
        _context = context;
        _emailService = emailService;
        _hasher = hasher;
        _appOptions = appOptions.Value;
    }

    public async Task SendResetEmailAsync(string email)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email.ToLower().Trim());

        if (user == null) return;

        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLower();
        var hashedToken = HashToken(rawToken);

        _context.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.ID,
            HashedToken = hashedToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        var resetUrl = $"{_appOptions.FrontendBaseUrl}/reset-password?token={rawToken}";
        await _emailService.SendPasswordResetEmailAsync(user.Email, resetUrl);
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword)
    {
        var hashedToken = HashToken(token);

        var resetToken = await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.HashedToken == hashedToken &&
                t.ExpiresAt > DateTime.UtcNow &&
                t.UsedAt == null);

        if (resetToken == null) return false;

        resetToken.User.Password = _hasher.Hash(newPassword);
        resetToken.UsedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes).ToLower();
    }
}
