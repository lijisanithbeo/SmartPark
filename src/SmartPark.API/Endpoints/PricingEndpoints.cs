using System.Security.Claims;
using SmartPark.Application.DTOs.Pricing;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Interfaces;

namespace SmartPark.API.Endpoints;

public static class PricingEndpoints
{
    public static void MapPricingEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/pricing").WithTags("Pricing");

        // GET /api/pricing/estimate?slotId=1&startTime=2024-01-01T10:00:00&endTime=2024-01-01T12:00:00
        group.MapGet("/estimate", async (
            int slotId,
            DateTime startTime,
            DateTime endTime,
            IPricingService pricing) =>
        {
            var estimate = await pricing.EstimatePriceAsync(slotId, startTime, endTime);
            return Results.Ok(estimate);
        }).RequireAuthorization();

        // GET /api/pricing/demand/{locationId} — public, no auth needed
        group.MapGet("/demand/{locationId:int}", async (int locationId, IPricingService pricing) =>
        {
            var demand = await pricing.GetDemandAsync(locationId);
            return Results.Ok(demand);
        });

        // GET /api/pricing/config/{locationId} — owner or admin
        group.MapGet("/config/{locationId:int}", async (
            int locationId,
            IPricingService pricing,
            IUnitOfWork uow,
            HttpContext ctx) =>
        {
            if (!await OwnerHasAccess(locationId, uow, ctx))
                return Results.Forbid();

            var config = await pricing.GetConfigAsync(locationId);
            return Results.Ok(config);
        }).RequireAuthorization("AdminOrOwner");

        // PUT /api/pricing/config/{locationId} — owner or admin
        group.MapPut("/config/{locationId:int}", async (
            int locationId,
            SavePricingConfigRequest request,
            IPricingService pricing,
            IUnitOfWork uow,
            HttpContext ctx) =>
        {
            if (!await OwnerHasAccess(locationId, uow, ctx))
                return Results.Forbid();

            var config = await pricing.SaveConfigAsync(locationId, request);
            return Results.Ok(config);
        }).RequireAuthorization("AdminOrOwner");
    }

    private static async Task<bool> OwnerHasAccess(int locationId, IUnitOfWork uow, HttpContext ctx)
    {
        if (ctx.User.IsInRole("Admin")) return true;

        var location = await uow.ParkingLocations.GetByIdAsync(locationId);
        if (location == null) return false;

        var ownerId = int.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return location.OwnerID == ownerId;
    }
}
