using SmartPark.Domain.Enums;

namespace SmartPark.Application.DTOs.Reservation;

public record PayReservationRequest(decimal Amount, PaymentMethod PaymentMethod);
