using SmartPark.Application.DTOs.Payment;

namespace SmartPark.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentDto> CreateAsync(CreatePaymentRequest request);
    Task<PaymentDto> GetByIdAsync(int id);
    Task<PaymentDto> GetByReservationAsync(int reservationId);
    Task<IEnumerable<AdminPaymentDto>> GetAllForAdminAsync();
    Task<PaymentDto> MarkSuccessAsync(int id);
    Task<PaymentDto> MarkFailedAsync(int id);
    Task<PaymentDto> PayReservationAsync(int reservationId, decimal amount, Domain.Enums.PaymentMethod method, int callerId);
}
