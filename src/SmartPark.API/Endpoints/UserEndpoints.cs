using System.Security.Claims;
using SmartPark.Application.DTOs.User;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Enums;

namespace SmartPark.API.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/users").WithTags("Users");

        // Admin-only endpoints
        group.MapGet("/", async (IUserService service) =>
            Results.Ok(await service.GetAllAsync()))
            .RequireAuthorization("AdminOnly");

        group.MapGet("/role/{role}", async (UserRole role, IUserService service) =>
            Results.Ok(await service.GetByRoleAsync(role)))
            .RequireAuthorization("AdminOnly");

        group.MapGet("/{id:int}", async (int id, IUserService service) =>
        {
            var user = await service.GetByIdAsync(id);
            return user is null ? Results.NotFound() : Results.Ok(user);
        }).RequireAuthorization("AdminOnly");

        group.MapPut("/{id:int}/toggle-active", async (int id, IUserService service) =>
            Results.Ok(new { isActive = await service.ToggleActiveAsync(id) }))
            .RequireAuthorization("AdminOnly");

        group.MapPut("/{id:int}", async (int id, UpdateUserRequest request, IUserService service) =>
        {
            var updated = await service.UpdateAsync(id, request);
            return updated is null ? Results.NotFound() : Results.Ok(updated);
        }).RequireAuthorization("AdminOnly");

        // Me endpoints — any authenticated user
        group.MapGet("/me", async (IUserService service, HttpContext ctx) =>
        {
            var callerId = int.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await service.GetByIdAsync(callerId);
            return user is null ? Results.NotFound() : Results.Ok(user);
        }).RequireAuthorization();

        group.MapPut("/me", async (UpdateUserRequest request, IUserService service, HttpContext ctx) =>
        {
            var callerId = int.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var updated = await service.UpdateAsync(callerId, request);
            return updated is null ? Results.NotFound() : Results.Ok(updated);
        }).RequireAuthorization();
    }
}
