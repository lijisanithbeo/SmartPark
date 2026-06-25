using SmartPark.Application.Interfaces;

namespace SmartPark.API.Endpoints;

public static class AnalyticsEndpoints
{
    public static void MapAnalyticsEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/analytics").WithTags("Analytics").RequireAuthorization("AdminOnly");

        group.MapGet("/dashboard-stats", async (IAnalyticsService service) =>
        {
            try
            {
                var result = await service.GetDashboardStatsAsync();
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        group.MapGet("/peak-hours", async (IAnalyticsService service) =>
        {
            try
            {
                var result = await service.GetPeakBookingHoursAsync();
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        group.MapGet("/peak-days", async (IAnalyticsService service) =>
        {
            try
            {
                var result = await service.GetPeakBookingDaysAsync();
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        group.MapGet("/reservation-trend", async (IAnalyticsService service, int days = 30) =>
        {
            try
            {
                var result = await service.GetReservationTrendAsync(days);
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        group.MapGet("/revenue-trend", async (IAnalyticsService service, int days = 30) =>
        {
            try
            {
                var result = await service.GetRevenueTrendAsync(days);
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        group.MapGet("/occupancy-trend", async (IAnalyticsService service, int days = 30) =>
        {
            try
            {
                var result = await service.GetOccupancyTrendAsync(days);
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        group.MapGet("/location-performance", async (IAnalyticsService service) =>
        {
            try
            {
                var result = await service.GetLocationPerformanceAsync();
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });
    }
}
