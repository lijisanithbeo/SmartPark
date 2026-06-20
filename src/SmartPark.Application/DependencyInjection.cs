using Microsoft.Extensions.DependencyInjection;
using SmartPark.Application.Interfaces;
using SmartPark.Application.Services;

namespace SmartPark.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IParkingLocationService, ParkingLocationService>();
        services.AddScoped<IParkingSlotService, ParkingSlotService>();
        services.AddScoped<IReservationService, ReservationService>();
        services.AddScoped<IPaymentService, PaymentService>();
        return services;
    }
}
