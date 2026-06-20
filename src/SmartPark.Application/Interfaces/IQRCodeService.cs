namespace SmartPark.Application.Interfaces;

public interface IQRCodeService
{
    Task<string> GenerateAsync(int reservationId);
    Task<bool> ValidateAsync(string qrToken);
}
