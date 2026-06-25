using SmartPark.Application.DTOs.Owner;
using SmartPark.Application.Interfaces;
using SmartPark.Domain.Enums;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Application.Services;

public class OwnerService : IOwnerService
{
    private readonly IUnitOfWork _uow;

    public OwnerService(IUnitOfWork uow) => _uow = uow;

    public async Task<OwnerDashboardStatsDto> GetDashboardStatsAsync(int ownerId)
    {
        var locations    = (await _uow.ParkingLocations.GetByOwnerAsync(ownerId)).ToList();
        var slots        = (await _uow.ParkingSlots.GetByOwnerAsync(ownerId)).ToList();
        var reservations = (await _uow.Reservations.GetByOwnerAsync(ownerId)).ToList();

        var today       = DateTime.UtcNow.Date;
        var monthStart  = new DateTime(today.Year, today.Month, 1);

        var activeReservations = reservations
            .Where(r => r.Status != ReservationStatus.Cancelled)
            .ToList();

        var todayReservations = reservations
            .Where(r => r.ReservationDate.Date == today)
            .ToList();

        var monthlyReservations = reservations
            .Where(r => r.ReservationDate >= monthStart)
            .ToList();

        return new OwnerDashboardStatsDto
        {
            TotalLocations     = locations.Count,
            TotalSlots         = slots.Count,
            AvailableSlots     = slots.Count(s => s.Status == SlotStatus.Available),
            OccupiedSlots      = slots.Count(s => s.Status == SlotStatus.Reserved),
            ActiveReservations = activeReservations.Count,
            TodayReservations  = todayReservations.Count,
            TodayRevenue       = todayReservations
                                    .Where(r => r.Payment?.PaymentStatus == PaymentStatus.Success)
                                    .Sum(r => r.Payment!.Amount),
            MonthlyRevenue     = monthlyReservations
                                    .Where(r => r.Payment?.PaymentStatus == PaymentStatus.Success)
                                    .Sum(r => r.Payment!.Amount),
            TotalRevenue       = reservations
                                    .Where(r => r.Payment?.PaymentStatus == PaymentStatus.Success)
                                    .Sum(r => r.Payment!.Amount),
        };
    }

    public async Task<IEnumerable<OwnerReservationDto>> GetReservationsAsync(int ownerId)
    {
        var reservations = await _uow.Reservations.GetByOwnerAsync(ownerId);

        return reservations.Select(r => new OwnerReservationDto
        {
            ReservationID  = r.ID,
            CustomerName   = $"{r.User.FirstName} {r.User.LastName}".Trim(),
            CustomerEmail  = r.User.Email,
            SlotNumber     = r.ParkingSlot.SlotNumber,
            LocationName   = r.ParkingSlot.Location.LocationName,
            BookingTime    = r.ReservationDate,
            StartTime      = r.StartTime,
            EndTime        = r.EndTime,
            Status         = r.Status.ToString(),
            Amount         = r.Payment?.Amount ?? 0m,
            PaymentStatus  = r.Payment?.PaymentStatus.ToString() ?? "Pending",
        });
    }
}
