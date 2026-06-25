using System.Security.Claims;
using SmartPark.Application.DTOs.Reservation;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Exceptions;

namespace SmartPark.API.Endpoints;

public static class ReservationEndpoints
{
    public static void MapReservationEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/reservations").WithTags("Reservations").RequireAuthorization();

        group.MapGet("/", async (IReservationService service) =>
            Results.Ok(await service.GetAllForAdminAsync())
        ).RequireAuthorization("AdminOnly");

        group.MapPost("/", async (CreateReservationRequest request, IReservationService service, ClaimsPrincipal user) =>
        {
            var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await service.CreateAsync(request, userId);
            return Results.Created($"/api/reservations/{result.ID}", result);
        }).RequireAuthorization("CustomerOnly");

        // Only the owner of the reservation or an Admin can view it
        group.MapGet("/{id:int}", async (int id, IReservationService service, ClaimsPrincipal user) =>
        {
            var callerId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin  = user.IsInRole("Admin");
            var result   = await service.GetByIdAsync(id);
            if (!isAdmin && result.UserID != callerId)
                throw new ForbiddenException("You do not have access to this reservation.");
            return Results.Ok(result);
        });

        // Customers can only fetch their own reservations; Admins can fetch any user's
        group.MapGet("/user/{userId:int}", async (int userId, IReservationService service, ClaimsPrincipal user) =>
        {
            var callerId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin  = user.IsInRole("Admin");
            if (!isAdmin && callerId != userId)
                throw new ForbiddenException("You can only view your own reservations.");
            return Results.Ok(await service.GetByUserAsync(userId));
        });

        // Only the owner of the reservation or an Admin can cancel it
        group.MapPut("/{id:int}/cancel", async (int id, IReservationService service, ClaimsPrincipal user) =>
        {
            var callerId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin  = user.IsInRole("Admin");
            var result   = await service.CancelAsync(id, callerId, isAdmin);
            return Results.Ok(result);
        });

        group.MapPut("/{id:int}/confirm", async (int id, IReservationService service) =>
            Results.Ok(await service.ConfirmAsync(id))
        ).RequireAuthorization("AdminOrOwner");

        // Only the owner of the reservation or an Admin can get the QR code
        group.MapGet("/{id:int}/qr-code", async (int id, IReservationService service, IQRCodeService qrCode, ClaimsPrincipal user) =>
        {
            var callerId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin  = user.IsInRole("Admin");
            var reservation = await service.GetByIdAsync(id);
            if (!isAdmin && reservation.UserID != callerId)
                throw new ForbiddenException("You do not have access to this QR code.");
            var base64 = await qrCode.GenerateAsync(id);
            return Results.Ok(new { qrCode = base64 });
        });

        // Customer pays for their reservation in one step (create + confirm atomically)
        group.MapPost("/{id:int}/pay", async (int id, PayReservationRequest req, IPaymentService paymentService, ClaimsPrincipal user) =>
        {
            var callerId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            return Results.Ok(await paymentService.PayReservationAsync(id, req.Amount, req.PaymentMethod, callerId));
        }).RequireAuthorization("CustomerOnly");
    }
}
