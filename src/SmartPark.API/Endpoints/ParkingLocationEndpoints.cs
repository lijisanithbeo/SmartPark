using Microsoft.AspNetCore.Mvc;
using SmartPark.Application.DTOs.ParkingLocation;
using SmartPark.Application.Interfaces;

namespace SmartPark.API.Endpoints;

public static class ParkingLocationEndpoints
{
    public static void MapParkingLocationEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/parking-locations").WithTags("ParkingLocations");

        group.MapGet("/", async (IParkingLocationService service) =>
            Results.Ok(await service.GetAllAsync()));

        group.MapGet("/{id:int}", async (int id, IParkingLocationService service) =>
            Results.Ok(await service.GetByIdAsync(id)));

        group.MapGet("/city/{city}", async (string city, IParkingLocationService service) =>
            Results.Ok(await service.GetByCityAsync(city)));

        group.MapPost("/", async (CreateParkingLocationRequest request, IParkingLocationService service) =>
        {
            var result = await service.CreateAsync(request);
            return Results.Created($"/api/parking-locations/{result.ID}", result);
        }).RequireAuthorization("AdminOrOwner");

        group.MapPut("/{id:int}", async (int id, UpdateParkingLocationRequest request, IParkingLocationService service) =>
            Results.Ok(await service.UpdateAsync(id, request))
        ).RequireAuthorization("AdminOrOwner");

        group.MapDelete("/{id:int}", async (int id, IParkingLocationService service) =>
        {
            await service.DeleteAsync(id);
            return Results.NoContent();
        }).RequireAuthorization("AdminOnly");
    }
}
