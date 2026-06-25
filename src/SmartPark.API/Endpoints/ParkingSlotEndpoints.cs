using System.Security.Claims;
using SmartPark.Application.DTOs.ParkingSlot;
using SmartPark.Application.Interfaces;

namespace SmartPark.API.Endpoints;

public static class ParkingSlotEndpoints
{
    public static void MapParkingSlotEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/parking-slots").WithTags("ParkingSlots");

        group.MapGet("/location/{locationId:int}", async (int locationId, IParkingSlotService service) =>
            Results.Ok(await service.GetByLocationAsync(locationId)));

        group.MapGet("/location/{locationId:int}/available", async (int locationId, IParkingSlotService service) =>
            Results.Ok(await service.GetAvailableByLocationAsync(locationId)));

        group.MapGet("/{id:int}", async (int id, IParkingSlotService service) =>
            Results.Ok(await service.GetByIdAsync(id)));

        group.MapPost("/", async (CreateParkingSlotRequest request, IParkingSlotService service, HttpContext ctx) =>
        {
            var callerId = int.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin  = ctx.User.IsInRole("Admin");
            var result   = await service.CreateAsync(request, callerId, isAdmin);
            return Results.Created($"/api/parking-slots/{result.ID}", result);
        }).RequireAuthorization("AdminOrOwner");

        group.MapPut("/{id:int}", async (int id, UpdateParkingSlotRequest request, IParkingSlotService service, HttpContext ctx) =>
        {
            var callerId = int.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin  = ctx.User.IsInRole("Admin");
            return Results.Ok(await service.UpdateAsync(id, request, callerId, isAdmin));
        }).RequireAuthorization("AdminOrOwner");

        group.MapDelete("/{id:int}", async (int id, IParkingSlotService service, HttpContext ctx) =>
        {
            var callerId = int.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin  = ctx.User.IsInRole("Admin");
            await service.DeleteAsync(id, callerId, isAdmin);
            return Results.NoContent();
        }).RequireAuthorization("AdminOrOwner");
    }
}
