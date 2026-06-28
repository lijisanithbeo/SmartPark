using SmartPark.Application.DTOs.Auth;
using SmartPark.Application.Interfaces;

namespace SmartPark.API.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (RegisterRequest request, IAuthService authService) =>
        {
            var result = await authService.RegisterAsync(request);
            return Results.Ok(result);
        });

        group.MapPost("/login", async (LoginRequest request, IAuthService authService) =>
        {
            var result = await authService.LoginAsync(request);
            return Results.Ok(result);
        });

        group.MapPost("/forgot-password", async (ForgotPasswordRequest request, IPasswordResetService passwordResetService) =>
        {
            var resetUrl = await passwordResetService.GenerateResetLinkAsync(request.Email);
            return Results.Ok(new { resetUrl });
        });

        group.MapPost("/reset-password", async (ResetPasswordRequest request, IPasswordResetService passwordResetService) =>
        {
            var success = await passwordResetService.ResetPasswordAsync(request.Token, request.NewPassword);
            return success
                ? Results.Ok(new { message = "Password reset successfully." })
                : Results.BadRequest(new { error = "Reset link is invalid or has expired." });
        });
    }
}
