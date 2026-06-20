using SmartPark.Application.Interfaces;
using SmartPark.Domain.Enums;

namespace SmartPark.API.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/users").WithTags("Users").RequireAuthorization("AdminOnly");

        group.MapGet("/", async (IUserService service) =>
            Results.Ok(await service.GetAllAsync()));

        group.MapGet("/role/{role}", async (UserRole role, IUserService service) =>
            Results.Ok(await service.GetByRoleAsync(role)));

        group.MapGet("/{id:int}", async (int id, IUserService service) =>
        {
            var user = await service.GetByIdAsync(id);
            return user is null ? Results.NotFound() : Results.Ok(user);
        });

        group.MapPut("/{id:int}/toggle-active", async (int id, IUserService service) =>
            Results.Ok(new { isActive = await service.ToggleActiveAsync(id) }));
    }
}
