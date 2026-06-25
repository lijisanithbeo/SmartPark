using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SmartPark.Infrastructure.Hubs;

[Authorize]
public class ParkingHub : Hub
{
    public Task JoinAdminGroup()
        => Groups.AddToGroupAsync(Context.ConnectionId, "Admin");

    public Task JoinOwnerGroup(int ownerId)
        => Groups.AddToGroupAsync(Context.ConnectionId, $"Owner-{ownerId}");

    public Task JoinLocationGroup(int locationId)
        => Groups.AddToGroupAsync(Context.ConnectionId, $"Location-{locationId}");

    public Task LeaveLocationGroup(int locationId)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Location-{locationId}");
}
