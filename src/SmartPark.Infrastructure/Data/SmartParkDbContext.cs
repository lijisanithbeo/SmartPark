using Microsoft.EntityFrameworkCore;
using SmartPark.Domain.Entities;
using SmartPark.Infrastructure.Data.Configurations;

namespace SmartPark.Infrastructure.Data;

public class SmartParkDbContext : DbContext
{
    public SmartParkDbContext(DbContextOptions<SmartParkDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<ParkingLocation> ParkingLocations => Set<ParkingLocation>();
    public DbSet<ParkingSlot> ParkingSlots => Set<ParkingSlot>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new ParkingLocationConfiguration());
        modelBuilder.ApplyConfiguration(new ParkingSlotConfiguration());
        modelBuilder.ApplyConfiguration(new ReservationConfiguration());
        modelBuilder.ApplyConfiguration(new PaymentConfiguration());
    }
}
