using SmartPark.Application.DTOs.Reservation;

namespace SmartPark.Application.Interfaces;

public interface IReservationService
{
    Task<ReservationDto> CreateAsync(CreateReservationRequest request);
    Task<ReservationDto> GetByIdAsync(int id);
    Task<IEnumerable<ReservationDto>> GetByUserAsync(int userId);
    Task<ReservationDto> CancelAsync(int id);
    Task<ReservationDto> ConfirmAsync(int id);
}
