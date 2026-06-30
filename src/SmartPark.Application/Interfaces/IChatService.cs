using SmartPark.Application.DTOs.Chat;

namespace SmartPark.Application.Interfaces;

public interface IChatService
{
    Task<string> ChatAsync(string message, List<ChatHistoryItem>? history, int userId, string role);
}
