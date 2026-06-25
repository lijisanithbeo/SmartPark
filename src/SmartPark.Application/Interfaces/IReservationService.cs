using SmartPark.Application.DTOs.Reservation;

namespace SmartPark.Application.Interfaces;

public interface IReservationService
{
    Task<ReservationDto> CreateAsync(CreateReservationRequest request, int userId);
    Task<ReservationDto> GetByIdAsync(int id);
    Task<IEnumerable<ReservationDto>> GetByUserAsync(int userId);
    Task<IEnumerable<AdminReservationDto>> GetAllForAdminAsync();
    Task<ReservationDto> CancelAsync(int id, int callerId, bool isAdmin);
    Task<ReservationDto> ConfirmAsync(int id);
}
