using Microsoft.EntityFrameworkCore;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Enums;

namespace SmartPark.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(SmartParkDbContext db)
    {
        if (await db.Users.AnyAsync()) return; // already seeded

        // ── Users ────────────────────────────────────────────────────────────
        var admin = new User
        {
            UserID      = "USR-ADMIN-001",
            FirstName   = "System",
            LastName    = "Admin",
            Email       = "admin@smartpark.com",
            Password    = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            PhoneNumber = "9000000001",
            Role        = UserRole.Admin,
            CreatedDate = DateTime.UtcNow,
            IsActive    = true
        };

        var owner = new User
        {
            UserID      = "USR-OWN-001",
            FirstName   = "Rajesh",
            LastName    = "Kumar",
            Email       = "owner@smartpark.com",
            Password    = BCrypt.Net.BCrypt.HashPassword("Owner@123"),
            PhoneNumber = "9000000002",
            Role        = UserRole.ParkingOwner,
            CreatedDate = DateTime.UtcNow,
            IsActive    = true
        };

        var customer = new User
        {
            UserID      = "USR-CUS-001",
            FirstName   = "Priya",
            LastName    = "Sharma",
            Email       = "customer@smartpark.com",
            Password    = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
            PhoneNumber = "9000000003",
            Role        = UserRole.Customer,
            CreatedDate = DateTime.UtcNow,
            IsActive    = true
        };

        db.Users.AddRange(admin, owner, customer);
        await db.SaveChangesAsync();

        // ── Parking Locations — real Chennai places ───────────────────────────
        var location1 = new ParkingLocation
        {
            LocationName = "Express Avenue Mall Parking",
            Address      = "49, Whites Road, Royapettah",
            City         = "Chennai",
            TotalSlots   = 10,
            CreatedDate  = DateTime.UtcNow,
            IsActive     = true
        };

        var location2 = new ParkingLocation
        {
            LocationName = "Chennai International Airport Parking",
            Address      = "Airport Road, Tirusulam",
            City         = "Chennai",
            TotalSlots   = 6,
            CreatedDate  = DateTime.UtcNow,
            IsActive     = true
        };

        var location3 = new ParkingLocation
        {
            LocationName = "Phoenix MarketCity Parking",
            Address      = "142, Velachery Main Road, Velachery",
            City         = "Chennai",
            TotalSlots   = 8,
            CreatedDate  = DateTime.UtcNow,
            IsActive     = true
        };

        db.ParkingLocations.AddRange(location1, location2, location3);
        await db.SaveChangesAsync();

        // ── Parking Slots — Location 1: Express Avenue (A Car, B Bike)
        var slots = new List<ParkingSlot>();

        for (int i = 1; i <= 5; i++)
            slots.Add(new ParkingSlot
            {
                LocationID   = location1.ID,
                SlotNumber   = $"A{i:D3}",
                FloorNumber  = 0,
                SlotType     = SlotType.Car,
                HourlyRate   = 50m,
                Status       = SlotStatus.Available,
                CreatedDate  = DateTime.UtcNow
            });

        for (int i = 1; i <= 5; i++)
            slots.Add(new ParkingSlot
            {
                LocationID   = location1.ID,
                SlotNumber   = $"B{i:D3}",
                FloorNumber  = 1,
                SlotType     = SlotType.Bike,
                HourlyRate   = 20m,
                Status       = SlotStatus.Available,
                CreatedDate  = DateTime.UtcNow
            });

        // ── Parking Slots — Location 2: Airport (C Car, D Bike)
        for (int i = 1; i <= 3; i++)
            slots.Add(new ParkingSlot
            {
                LocationID   = location2.ID,
                SlotNumber   = $"C{i:D3}",
                FloorNumber  = 0,
                SlotType     = SlotType.Car,
                HourlyRate   = 80m,
                Status       = SlotStatus.Available,
                CreatedDate  = DateTime.UtcNow
            });

        for (int i = 1; i <= 3; i++)
            slots.Add(new ParkingSlot
            {
                LocationID   = location2.ID,
                SlotNumber   = $"D{i:D3}",
                FloorNumber  = 1,
                SlotType     = SlotType.Bike,
                HourlyRate   = 30m,
                Status       = SlotStatus.Available,
                CreatedDate  = DateTime.UtcNow
            });

        // ── Parking Slots — Location 3: Phoenix MarketCity (E Car, F Bike)
        for (int i = 1; i <= 4; i++)
            slots.Add(new ParkingSlot
            {
                LocationID   = location3.ID,
                SlotNumber   = $"E{i:D3}",
                FloorNumber  = 0,
                SlotType     = SlotType.Car,
                HourlyRate   = 60m,
                Status       = SlotStatus.Available,
                CreatedDate  = DateTime.UtcNow
            });

        for (int i = 1; i <= 4; i++)
            slots.Add(new ParkingSlot
            {
                LocationID   = location3.ID,
                SlotNumber   = $"F{i:D3}",
                FloorNumber  = 1,
                SlotType     = SlotType.Bike,
                HourlyRate   = 25m,
                Status       = SlotStatus.Available,
                CreatedDate  = DateTime.UtcNow
            });

        db.ParkingSlots.AddRange(slots);
        await db.SaveChangesAsync();
    }
}
