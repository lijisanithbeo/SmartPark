using Microsoft.AspNetCore.SignalR;
using SmartPark.Application.Interfaces;
using SmartPark.Infrastructure.Hubs;

namespace SmartPark.Infrastructure.Services;

public class RealtimeService : IRealtimeService
{
    private readonly IHubContext<ParkingHub> _hub;

    public RealtimeService(IHubContext<ParkingHub> hub) => _hub = hub;

    public Task NotifySlotStatusChangedAsync(int slotId, int locationId, string status)
        => _hub.Clients.All.SendAsync("SlotStatusChanged", new { slotId, locationId, status });

    public async Task NotifyBookingCreatedAsync(int reservationId, int locationId, int? ownerId)
    {
        var payload = new { reservationId, locationId, ownerId };
        await _hub.Clients.Group("Admin").SendAsync("BookingCreated", payload);
        if (ownerId.HasValue)
            await _hub.Clients.Group($"Owner-{ownerId}").SendAsync("BookingCreated", payload);
    }

    public async Task NotifyBookingCancelledAsync(int reservationId, int locationId, int? ownerId)
    {
        var payload = new { reservationId, locationId, ownerId };
        await _hub.Clients.Group("Admin").SendAsync("BookingCancelled", payload);
        if (ownerId.HasValue)
            await _hub.Clients.Group($"Owner-{ownerId}").SendAsync("BookingCancelled", payload);
    }

    public async Task NotifyPaymentCompletedAsync(int paymentId, int reservationId, int? ownerId)
    {
        var payload = new { paymentId, reservationId, ownerId };
        await _hub.Clients.Group("Admin").SendAsync("PaymentCompleted", payload);
        if (ownerId.HasValue)
            await _hub.Clients.Group($"Owner-{ownerId}").SendAsync("PaymentCompleted", payload);
    }
}
