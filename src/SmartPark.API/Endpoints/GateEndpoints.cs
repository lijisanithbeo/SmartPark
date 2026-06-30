using SmartPark.Application.DTOs.Gate;
using SmartPark.Application.Interfaces;

namespace SmartPark.API.Endpoints;

public static class GateEndpoints
{
    public static void MapGateEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/gate")
            .WithTags("Gate")
            .RequireAuthorization("AdminOrOwner");

        // Scan QR — returns booking details for display at the gate
        group.MapGet("/scan", async (string qr, IGateService gate) =>
            Results.Ok(await gate.ScanAsync(qr)));

        // Record vehicle entry
        group.MapPost("/checkin", async (GateActionRequest req, IGateService gate) =>
            Results.Ok(await gate.CheckInAsync(req.QrPayload)));

        // Record vehicle exit + overstay billing
        group.MapPost("/checkout", async (GateCheckOutRequest req, IGateService gate) =>
            Results.Ok(await gate.CheckOutAsync(req.QrPayload, req.OverstayPaid)));
    }
}
