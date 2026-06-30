using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using SmartPark.Application.DTOs.Chat;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Enums;
using SmartPark.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace SmartPark.Infrastructure.Services;

public class ChatService : IChatService
{
    private readonly IUnitOfWork _uow;
    private readonly HttpClient  _http;
    private readonly string      _apiKey;

    public ChatService(IUnitOfWork uow, IHttpClientFactory httpFactory, IConfiguration config)
    {
        _uow    = uow;
        _http   = httpFactory.CreateClient("Groq");
        _apiKey = config["Groq:ApiKey"] ?? "";
    }

    public async Task<string> ChatAsync(string message, List<ChatHistoryItem>? history, int userId, string role)
    {
        var context      = await BuildContextAsync(userId, role);
        var systemPrompt = BuildSystemPrompt(role, context);
        var result       = await CallDeepSeekAsync(systemPrompt, message, history);
        return result ?? "I'm having trouble connecting right now. Please try again in a moment.";
    }

    // ─── DeepSeek API ────────────────────────────────────────────────────────

    private async Task<string?> CallDeepSeekAsync(string systemPrompt, string userMessage, List<ChatHistoryItem>? history)
    {
        var messages = new List<object> { new { role = "system", content = systemPrompt } };

        if (history != null)
            foreach (var h in history.TakeLast(6))
                messages.Add(new { role = h.Role.ToLower(), content = h.Content });

        messages.Add(new { role = "user", content = userMessage });

        var payload = JsonSerializer.Serialize(new
        {
            model       = "llama-3.3-70b-versatile",
            messages,
            max_tokens  = 600,
            temperature = 0.5
        });

        var req = new HttpRequestMessage(HttpMethod.Post, "/openai/v1/chat/completions")
        {
            Content = new StringContent(payload, Encoding.UTF8, "application/json")
        };
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        try
        {
            var res  = await _http.SendAsync(req);
            var body = await res.Content.ReadAsStringAsync();
            if (!res.IsSuccessStatusCode) return $"API error {(int)res.StatusCode}: {body}";
            using var doc = JsonDocument.Parse(body);
            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();
        }
        catch (Exception ex)
        {
            return $"Connection error: {ex.Message}";
        }
    }

    // ─── System Prompt ───────────────────────────────────────────────────────

    private static string BuildSystemPrompt(string role, string context) => $"""
        You are a smart assistant embedded in SmartPark, a parking management platform.

        USER ROLE: {role}

        LIVE PLATFORM DATA (fetched right now from the database):
        {context}

        INSTRUCTIONS:
        - Answer questions about SmartPark using the live data above.
        - Give specific, accurate answers using real numbers from the data.
        - Keep responses concise (3–8 lines max). Use bullet points where helpful.
        - If the user asks something not in the data, say so honestly.
        - Do NOT make up numbers or locations that aren't in the data above.
        - Speak naturally — you are a helpful parking assistant, not a robot.

        ROLE FOCUS:
        - Customer  → bookings, available slots, pricing, locations, how to book/cancel
        - ParkingOwner → their revenue, occupancy, booking stats, slot management
        - Admin     → platform-wide stats, users, locations, revenue overview
        """;

    // ─── DB Context Builder ──────────────────────────────────────────────────

    private async Task<string> BuildContextAsync(int userId, string role)
    {
        var sb = new StringBuilder();
        var now = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

        // ── Locations, slots & pricing (all roles) ───────────────────────────
        var locations = (await _uow.ParkingLocations.GetActiveLocationsAsync()).ToList();
        sb.AppendLine($"Active parking locations: {locations.Count}");
        foreach (var loc in locations)
        {
            var avail  = (await _uow.ParkingSlots.GetAvailableSlotsByLocationAsync(loc.ID)).Count();
            var slots  = (await _uow.ParkingSlots.GetByLocationIdAsync(loc.ID)).ToList();
            var config = await _uow.PricingConfigs.GetByLocationIdAsync(loc.ID);

            sb.AppendLine($"  - {loc.LocationName} ({loc.City}): {avail}/{loc.TotalSlots} slots available");

            if (config != null)
            {
                sb.AppendLine($"    Normal rate: ₹{config.NormalRate:F0}/hr");
                if (config.WeekdayPeakEnabled)
                    sb.AppendLine($"    Weekday peak: ₹{config.WeekdayPeakRate:F0}/hr ({config.WeekdayPeakStartHour}:00–{config.WeekdayPeakEndHour}:00)");
                if (config.WeekendPeakEnabled)
                    sb.AppendLine($"    Weekend peak: ₹{config.WeekendPeakRate:F0}/hr ({config.WeekendPeakStartHour}:00–{config.WeekendPeakEndHour}:00)");
                if (!config.WeekdayPeakEnabled && !config.WeekendPeakEnabled)
                    sb.AppendLine($"    No peak pricing configured");
            }
            else if (slots.Any())
            {
                var min = slots.Min(s => s.HourlyRate);
                var max = slots.Max(s => s.HourlyRate);
                sb.AppendLine(min == max ? $"    Rate: ₹{min:F0}/hr" : $"    Rate: ₹{min:F0}–₹{max:F0}/hr");
            }
        }

        if (role == "Customer")
        {
            // Customer's own bookings
            var bookings = (await _uow.Reservations.GetByUserIdAsync(userId)).ToList();
            var active   = bookings.Where(r => r.Status != ReservationStatus.Cancelled && r.EndTime > now).ToList();
            sb.AppendLine($"\nYour total bookings: {bookings.Count}");
            sb.AppendLine($"Active/upcoming bookings: {active.Count}");
            sb.AppendLine($"Cancelled bookings: {bookings.Count(r => r.Status == ReservationStatus.Cancelled)}");
            if (active.Any())
            {
                sb.AppendLine("Your current/upcoming reservations:");
                foreach (var b in active.Take(3))
                {
                    var loc  = b.ParkingSlot?.Location?.LocationName ?? "?";
                    var slot = b.ParkingSlot?.SlotNumber ?? "?";
                    sb.AppendLine($"  - Slot {slot} at {loc}: {b.StartTime:dd MMM HH:mm} – {b.EndTime:HH:mm} ({b.Status})");
                }
            }

        }
        else if (role == "ParkingOwner")
        {
            var ownerLocs = (await _uow.ParkingLocations.GetByOwnerAsync(userId)).ToList();
            var allRes    = (await _uow.Reservations.GetByOwnerAsync(userId)).ToList();
            var revenue   = allRes.Where(r => r.Payment?.PaymentStatus == PaymentStatus.Success).Sum(r => r.Payment?.Amount ?? 0);
            var todayRes  = allRes.Where(r => r.ReservationDate.Date == now.Date).ToList();
            var monthRes  = allRes.Where(r => r.ReservationDate >= new DateTime(now.Year, now.Month, 1)).ToList();

            sb.AppendLine($"\nYour locations: {ownerLocs.Count}");
            foreach (var loc in ownerLocs)
            {
                var avail = (await _uow.ParkingSlots.GetAvailableSlotsByLocationAsync(loc.ID)).Count();
                sb.AppendLine($"  - {loc.LocationName}: {loc.TotalSlots - avail}/{loc.TotalSlots} occupied");
            }
            sb.AppendLine($"\nTotal revenue (all time): ₹{revenue:F0}");
            sb.AppendLine($"Total reservations: {allRes.Count} (Confirmed: {allRes.Count(r => r.Status == ReservationStatus.Confirmed)}, Cancelled: {allRes.Count(r => r.Status == ReservationStatus.Cancelled)})");
            sb.AppendLine($"Today's bookings: {todayRes.Count}");
            sb.AppendLine($"This month's bookings: {monthRes.Count}");
            sb.AppendLine($"This month's revenue: ₹{monthRes.Where(r => r.Payment?.PaymentStatus == PaymentStatus.Success).Sum(r => r.Payment?.Amount ?? 0):F0}");

            // Most popular slot
            var topSlot = allRes.Where(r => r.ParkingSlot != null)
                .GroupBy(r => new { r.SlotID, SlotNum = r.ParkingSlot!.SlotNumber, Loc = r.ParkingSlot.Location?.LocationName ?? "?" })
                .OrderByDescending(g => g.Count()).FirstOrDefault();
            if (topSlot != null)
                sb.AppendLine($"Most booked slot: Slot {topSlot.Key.SlotNum} at {topSlot.Key.Loc} ({topSlot.Count()} bookings)");
        }
        else if (role == "Admin")
        {
            var users    = (await _uow.Users.GetAllAsync()).ToList();
            var allLocs  = (await _uow.ParkingLocations.GetAllLocationsAsync()).ToList();
            var allRes   = (await _uow.Reservations.GetAllWithDetailsAsync()).ToList();
            var revenue  = allRes.Where(r => r.Payment?.PaymentStatus == PaymentStatus.Success).Sum(r => r.Payment?.Amount ?? 0);
            var todayRes = allRes.Where(r => r.ReservationDate.Date == now.Date).ToList();
            var monthRes = allRes.Where(r => r.ReservationDate >= new DateTime(now.Year, now.Month, 1)).ToList();

            sb.AppendLine($"\nTotal users: {users.Count} (Customers: {users.Count(u => u.Role == UserRole.Customer)}, Owners: {users.Count(u => u.Role == UserRole.ParkingOwner)}, Admins: {users.Count(u => u.Role == UserRole.Admin)})");
            sb.AppendLine($"Total locations: {allLocs.Count} (Active: {locations.Count})");
            sb.AppendLine($"Total reservations: {allRes.Count} (Confirmed: {allRes.Count(r => r.Status == ReservationStatus.Confirmed)}, Cancelled: {allRes.Count(r => r.Status == ReservationStatus.Cancelled)}, Pending: {allRes.Count(r => r.Status == ReservationStatus.Pending)})");
            sb.AppendLine($"Total platform revenue: ₹{revenue:F0}");
            sb.AppendLine($"Today's bookings: {todayRes.Count}");
            sb.AppendLine($"This month's bookings: {monthRes.Count}");
            sb.AppendLine($"This month's revenue: ₹{monthRes.Where(r => r.Payment?.PaymentStatus == PaymentStatus.Success).Sum(r => r.Payment?.Amount ?? 0):F0}");

            // Most popular location
            var topLoc = allRes.Where(r => r.ParkingSlot?.Location != null)
                .GroupBy(r => r.ParkingSlot!.Location!.LocationName)
                .OrderByDescending(g => g.Count()).FirstOrDefault();
            if (topLoc != null)
                sb.AppendLine($"Most popular location: {topLoc.Key} ({topLoc.Count()} bookings)");
        }

        return sb.ToString();
    }
}
