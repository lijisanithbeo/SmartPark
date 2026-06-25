using System.Security.Claims;
using SmartPark.Application.DTOs.ParkingLocation;
using SmartPark.Application.Interfaces;

namespace SmartPark.API.Endpoints;

public static class ParkingLocationEndpoints
{
    public static void MapParkingLocationEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/parking-locations").WithTags("ParkingLocations");

        // Public — all active locations (customer search)
        group.MapGet("/", async (IParkingLocationService service) =>
            Results.Ok(await service.GetAllAsync()));

        // Admin — all locations including inactive, with owner name
        group.MapGet("/admin/all", async (IParkingLocationService service) =>
            Results.Ok(await service.GetAllForAdminAsync()))
            .RequireAuthorization("AdminOnly");

        group.MapGet("/{id:int}", async (int id, IParkingLocationService service) =>
            Results.Ok(await service.GetByIdAsync(id)));

        group.MapGet("/city/{city}", async (string city, IParkingLocationService service) =>
            Results.Ok(await service.GetByCityAsync(city)));

        // Owner-scoped — returns only the caller's own locations
        group.MapGet("/my", async (IParkingLocationService service, HttpContext ctx) =>
        {
            var ownerId = int.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            return Results.Ok(await service.GetByOwnerAsync(ownerId));
        }).RequireAuthorization("AdminOrOwner");

        group.MapPost("/", async (CreateParkingLocationRequest request, IParkingLocationService service, HttpContext ctx) =>
        {
            var ownerId = int.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result  = await service.CreateAsync(request, ownerId);
            return Results.Created($"/api/parking-locations/{result.ID}", result);
        }).RequireAuthorization("AdminOrOwner");

        group.MapPut("/{id:int}", async (int id, UpdateParkingLocationRequest request, IParkingLocationService service, HttpContext ctx) =>
        {
            var callerId = int.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin  = ctx.User.IsInRole("Admin");
            return Results.Ok(await service.UpdateAsync(id, request, callerId, isAdmin));
        }).RequireAuthorization("AdminOrOwner");

        group.MapDelete("/{id:int}", async (int id, IParkingLocationService service, HttpContext ctx) =>
        {
            var callerId = int.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin  = ctx.User.IsInRole("Admin");
            await service.DeleteAsync(id, callerId, isAdmin);
            return Results.NoContent();
        }).RequireAuthorization("AdminOrOwner");
    }
}
