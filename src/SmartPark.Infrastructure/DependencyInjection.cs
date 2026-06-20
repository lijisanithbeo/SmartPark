using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Interfaces;
using SmartPark.Infrastructure.Data;
using SmartPark.Infrastructure.Services;

namespace SmartPark.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<SmartParkDbContext>(options =>
            options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IQRCodeService, QRCodeService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IPricingService, PricingService>();

        return services;
    }
}
