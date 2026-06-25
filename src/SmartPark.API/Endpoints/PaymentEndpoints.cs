using SmartPark.Application.DTOs.Payment;
using SmartPark.Application.Interfaces;

namespace SmartPark.API.Endpoints;

public static class PaymentEndpoints
{
    public static void MapPaymentEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/payments").WithTags("Payments").RequireAuthorization();

        group.MapGet("/", async (IPaymentService service) =>
            Results.Ok(await service.GetAllForAdminAsync())
        ).RequireAuthorization("AdminOnly");

        group.MapPost("/", async (CreatePaymentRequest request, IPaymentService service) =>
        {
            var result = await service.CreateAsync(request);
            return Results.Created($"/api/payments/{result.ID}", result);
        }).RequireAuthorization("CustomerOnly");

        group.MapGet("/{id:int}", async (int id, IPaymentService service) =>
            Results.Ok(await service.GetByIdAsync(id))
        ).RequireAuthorization("AdminOnly");

        group.MapGet("/reservation/{reservationId:int}", async (int reservationId, IPaymentService service) =>
            Results.Ok(await service.GetByReservationAsync(reservationId))
        ).RequireAuthorization("AdminOnly");

        group.MapPut("/{id:int}/success", async (int id, IPaymentService service) =>
            Results.Ok(await service.MarkSuccessAsync(id))
        ).RequireAuthorization("AdminOnly");

        group.MapPut("/{id:int}/failed", async (int id, IPaymentService service) =>
            Results.Ok(await service.MarkFailedAsync(id))
        ).RequireAuthorization("AdminOnly");
    }
}




