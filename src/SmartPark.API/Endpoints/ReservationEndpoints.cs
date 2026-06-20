using SmartPark.Application.DTOs.Reservation;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Enums;

namespace SmartPark.API.Endpoints;

public static class ReservationEndpoints
{
    public static void MapReservationEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/reservations").WithTags("Reservations").RequireAuthorization();

        group.MapPost("/", async (CreateReservationRequest request, IReservationService service) =>
        {
            var result = await service.CreateAsync(request);
            return Results.Created($"/api/reservations/{result.ID}", result);
        }).RequireAuthorization("CustomerOnly");

        group.MapGet("/{id:int}", async (int id, IReservationService service) =>
            Results.Ok(await service.GetByIdAsync(id)));

        group.MapGet("/user/{userId:int}", async (int userId, IReservationService service) =>
            Results.Ok(await service.GetByUserAsync(userId)));

        group.MapPut("/{id:int}/cancel", async (int id, IReservationService service) =>
            Results.Ok(await service.CancelAsync(id)));

        group.MapPut("/{id:int}/confirm", async (int id, IReservationService service) =>
            Results.Ok(await service.ConfirmAsync(id))
        ).RequireAuthorization("AdminOrOwner");

        group.MapGet("/{id:int}/qr-code", async (int id, IQRCodeService qrCode) =>
        {
            var base64 = await qrCode.GenerateAsync(id);
            return Results.Ok(new { qrCode = base64 });
        });

        // Customer pays for their reservation in one step (create + confirm atomically)
        group.MapPost("/{id:int}/pay", async (int id, PayReservationRequest req, IPaymentService paymentService) =>
            Results.Ok(await paymentService.PayReservationAsync(id, req.Amount, req.PaymentMethod))
        ).RequireAuthorization("CustomerOnly");
    }
}
