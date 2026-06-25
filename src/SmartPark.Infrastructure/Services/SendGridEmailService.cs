using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using SmartPark.Application.Interfaces;
using SmartPark.Infrastructure.Options;

namespace SmartPark.Infrastructure.Services;

public class SendGridEmailService : IEmailService
{
    private readonly SendGridOptions _options;

    public SendGridEmailService(IOptions<SendGridOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetUrl)
    {
        var client = new SendGridClient(_options.ApiKey);
        var from = new EmailAddress(_options.SenderEmail, _options.SenderName);
        var to = new EmailAddress(toEmail);
        const string subject = "Reset your SmartPark password";

        var plainText =
            $"Reset your SmartPark password by visiting the link below.\n\n{resetUrl}\n\n" +
            "This link expires in 15 minutes. If you did not request this, you can safely ignore this email.";

        var html = $"""
            <p>You requested a password reset for your SmartPark account.</p>
            <p><a href="{resetUrl}">Reset your password</a></p>
            <p>This link expires in <strong>15 minutes</strong>.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
            """;

        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainText, html);
        var response = await client.SendEmailAsync(msg);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"SendGrid returned {(int)response.StatusCode}");
    }
}
