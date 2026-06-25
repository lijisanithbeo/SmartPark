using Microsoft.EntityFrameworkCore;
using SmartPark.Domain.Entities;
using SmartPark.Domain.Enums;

namespace SmartPark.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(SmartParkDbContext db)
    {
        // ── Phase 1: Base entities (users, locations, slots) ─────────────────
        if (!await db.Users.AnyAsync())
        {
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

            // Fix-up: assign any locations added by previous migrations (e.g. AddKeralaLocations)
            // that don't yet have an owner to this owner
            var unassigned = await db.ParkingLocations.Where(l => l.OwnerID == null).ToListAsync();
            if (unassigned.Count > 0)
            {
                foreach (var loc in unassigned)
                    loc.OwnerID = owner.ID;
                await db.SaveChangesAsync();
            }

            // ── Parking Locations — real Chennai places ───────────────────
            var location1 = ParkingLocation.Create(
                "Express Avenue Mall Parking",
                "49, Whites Road, Royapettah",
                "Chennai",
                10,
                owner.ID);

            var location2 = ParkingLocation.Create(
                "Chennai International Airport Parking",
                "Airport Road, Tirusulam",
                "Chennai",
                6,
                owner.ID);

            var location3 = ParkingLocation.Create(
                "Phoenix MarketCity Parking",
                "142, Velachery Main Road, Velachery",
                "Chennai",
                8,
                owner.ID);

            db.ParkingLocations.AddRange(location1, location2, location3);
            await db.SaveChangesAsync();

            // ── Parking Slots ─────────────────────────────────────────────
            var slots = new List<ParkingSlot>();

            // Location 1: Express Avenue (A=Car, B=Bike)
            for (int i = 1; i <= 5; i++)
                slots.Add(new ParkingSlot
                {
                    LocationID  = location1.ID,
                    SlotNumber  = $"A{i:D3}",
                    FloorNumber = 0,
                    SlotType    = SlotType.Car,
                    HourlyRate  = 50m,
                    Status      = SlotStatus.Available,
                    CreatedDate = DateTime.UtcNow
                });

            for (int i = 1; i <= 5; i++)
                slots.Add(new ParkingSlot
                {
                    LocationID  = location1.ID,
                    SlotNumber  = $"B{i:D3}",
                    FloorNumber = 1,
                    SlotType    = SlotType.Bike,
                    HourlyRate  = 20m,
                    Status      = SlotStatus.Available,
                    CreatedDate = DateTime.UtcNow
                });

            // Location 2: Airport (C=Car, D=Bike)
            for (int i = 1; i <= 3; i++)
                slots.Add(new ParkingSlot
                {
                    LocationID  = location2.ID,
                    SlotNumber  = $"C{i:D3}",
                    FloorNumber = 0,
                    SlotType    = SlotType.Car,
                    HourlyRate  = 80m,
                    Status      = SlotStatus.Available,
                    CreatedDate = DateTime.UtcNow
                });

            for (int i = 1; i <= 3; i++)
                slots.Add(new ParkingSlot
                {
                    LocationID  = location2.ID,
                    SlotNumber  = $"D{i:D3}",
                    FloorNumber = 1,
                    SlotType    = SlotType.Bike,
                    HourlyRate  = 30m,
                    Status      = SlotStatus.Available,
                    CreatedDate = DateTime.UtcNow
                });

            // Location 3: Phoenix MarketCity (E=Car, F=Bike)
            for (int i = 1; i <= 4; i++)
                slots.Add(new ParkingSlot
                {
                    LocationID  = location3.ID,
                    SlotNumber  = $"E{i:D3}",
                    FloorNumber = 0,
                    SlotType    = SlotType.Car,
                    HourlyRate  = 60m,
                    Status      = SlotStatus.Available,
                    CreatedDate = DateTime.UtcNow
                });

            for (int i = 1; i <= 4; i++)
                slots.Add(new ParkingSlot
                {
                    LocationID  = location3.ID,
                    SlotNumber  = $"F{i:D3}",
                    FloorNumber = 1,
                    SlotType    = SlotType.Bike,
                    HourlyRate  = 25m,
                    Status      = SlotStatus.Available,
                    CreatedDate = DateTime.UtcNow
                });

            db.ParkingSlots.AddRange(slots);
            await db.SaveChangesAsync();
        }

        // ── Phase 1b: Pricing configs ─────────────────────────────────────────
        if (!await db.PricingConfigs.AnyAsync())
        {
            var locations = await db.ParkingLocations.ToListAsync();
            if (locations.Count >= 3)
            {
                // Express Avenue Mall — moderate weekday peak (office hours)
                db.PricingConfigs.Add(new PricingConfig
                {
                    LocationID           = locations[0].ID,
                    NormalRate           = 50m,
                    WeekdayPeakEnabled   = true,
                    WeekdayPeakStartHour = 9,
                    WeekdayPeakEndHour   = 21,
                    WeekdayPeakRate      = 80m,
                    WeekendPeakEnabled   = true,
                    WeekendPeakStartHour = 10,
                    WeekendPeakEndHour   = 22,
                    WeekendPeakRate      = 100m,
                });

                // Airport — always high demand, premium weekend
                db.PricingConfigs.Add(new PricingConfig
                {
                    LocationID           = locations[1].ID,
                    NormalRate           = 80m,
                    WeekdayPeakEnabled   = true,
                    WeekdayPeakStartHour = 6,
                    WeekdayPeakEndHour   = 22,
                    WeekdayPeakRate      = 120m,
                    WeekendPeakEnabled   = true,
                    WeekendPeakStartHour = 6,
                    WeekendPeakEndHour   = 23,
                    WeekendPeakRate      = 150m,
                });

                // Phoenix MarketCity — weekend shopping peak
                db.PricingConfigs.Add(new PricingConfig
                {
                    LocationID           = locations[2].ID,
                    NormalRate           = 60m,
                    WeekdayPeakEnabled   = false,
                    WeekdayPeakStartHour = 18,
                    WeekdayPeakEndHour   = 21,
                    WeekdayPeakRate      = 90m,
                    WeekendPeakEnabled   = true,
                    WeekendPeakStartHour = 11,
                    WeekendPeakEndHour   = 21,
                    WeekendPeakRate      = 100m,
                });

                await db.SaveChangesAsync();
            }
        }

        // ── Phase 2: Reservations & Payments (historical demo data) ──────────
        // Runs even if users already exist — allows re-seeding analytics data
        // on an existing DB that has no reservations yet.
        if (!await db.Reservations.AnyAsync())
        {
            var customer = await db.Users.FirstAsync(u => u.Role == UserRole.Customer);
            var allSlots = await db.ParkingSlots.ToListAsync();

            if (allSlots.Count == 0) return;

            var slotRates = allSlots.ToDictionary(s => s.ID, s => s.HourlyRate);

            // Peak hours weighted toward morning (8-11) and evening (17-20)
            var peakHourPool = new[] { 8, 9, 9, 10, 10, 11, 11, 17, 17, 18, 18, 19, 20 };
            var rng = new Random(42); // fixed seed → reproducible

            var seedReservations = new List<Reservation>();

            for (int dayOffset = 29; dayOffset >= 0; dayOffset--)
            {
                var date = DateTime.UtcNow.Date.AddDays(-dayOffset);

                int count = date.DayOfWeek switch
                {
                    DayOfWeek.Saturday or DayOfWeek.Sunday => rng.Next(6, 11),
                    DayOfWeek.Friday                        => rng.Next(4, 8),
                    _                                        => rng.Next(2, 6)
                };

                for (int b = 0; b < count; b++)
                {
                    var slot      = allSlots[rng.Next(allSlots.Count)];
                    int startHour = peakHourPool[rng.Next(peakHourPool.Length)];
                    int dur       = rng.Next(1, 4); // 1–3 hours

                    seedReservations.Add(new Reservation
                    {
                        UserID          = customer.ID,
                        SlotID          = slot.ID,
                        ReservationDate = date,
                        StartTime       = date.AddHours(startHour),
                        EndTime         = date.AddHours(startHour + dur),
                        Status          = ReservationStatus.Confirmed
                    });
                }
            }

            db.Reservations.AddRange(seedReservations);
            await db.SaveChangesAsync();

            // One payment per reservation (IDs are populated after SaveChangesAsync)
            var seedPayments = seedReservations.Select((res, i) =>
            {
                var dur = (decimal)(res.EndTime - res.StartTime).TotalHours;
                return new Payment
                {
                    ReservationID = res.ID,
                    Amount        = slotRates[res.SlotID] * dur,
                    PaymentMethod = (PaymentMethod)(i % 3),
                    TransactionID = $"TXN{i + 1:D6}",
                    PaymentStatus = PaymentStatus.Success,
                    PaymentDate   = res.StartTime.AddMinutes(-30)
                };
            }).ToList();

            db.Payments.AddRange(seedPayments);
            await db.SaveChangesAsync();
        }
    }
}
