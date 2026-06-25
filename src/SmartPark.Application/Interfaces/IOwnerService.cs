using SmartPark.Application.DTOs.Owner;

namespace SmartPark.Application.Interfaces;

public interface IOwnerService
{
    Task<OwnerDashboardStatsDto> GetDashboardStatsAsync(int ownerId);
    Task<IEnumerable<OwnerReservationDto>> GetReservationsAsync(int ownerId);
}
