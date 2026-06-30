namespace SmartPark.Application.DTOs.Chat;

public record ChatHistoryItem(string Role, string Content);
public record ChatRequest(string Message, List<ChatHistoryItem>? History = null);
public record ChatResponse(string Reply);
