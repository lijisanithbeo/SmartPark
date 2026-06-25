using System.Security.Claims;
using SmartPark.Application.Interfaces;

namespace SmartPark.API.Endpoints;

public static class OwnerEndpoints
{
    public static void MapOwnerEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/owner").WithTags("Owner")
                       .RequireAuthorization("AdminOrOwner");

        group.MapGet("/dashboard-stats", async (IOwnerService service, HttpContext ctx) =>
        {
            var ownerId = int.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            return Results.Ok(await service.GetDashboardStatsAsync(ownerId));
        });

        group.MapGet("/reservations", async (IOwnerService service, HttpContext ctx) =>
        {
            var ownerId = int.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            return Results.Ok(await service.GetReservationsAsync(ownerId));
        });
    }
}
