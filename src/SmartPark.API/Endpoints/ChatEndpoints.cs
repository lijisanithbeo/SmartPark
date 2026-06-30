using System.Security.Claims;
using SmartPark.Application.DTOs.Chat;
using SmartPark.Application.Interfaces;

namespace SmartPark.API.Endpoints;

public static class ChatEndpoints
{
    public static void MapChatEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/chat").WithTags("Chat").RequireAuthorization();

        group.MapPost("/", async (ChatRequest request, IChatService chatService, ClaimsPrincipal user) =>
        {
            var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = user.FindFirstValue(ClaimTypes.Role) ?? "Customer";
            var reply = await chatService.ChatAsync(request.Message, request.History, userId, role);
            return Results.Ok(new ChatResponse(reply));
        });
    }
}
