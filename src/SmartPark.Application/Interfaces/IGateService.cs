using SmartPark.Application.DTOs.Gate;

namespace SmartPark.Application.Interfaces;

public interface IGateService
{
    Task<GateScanResultDto> ScanAsync(string qrPayload);
    Task<GateCheckInDto>    CheckInAsync(string qrPayload);
    Task<GateCheckOutDto>   CheckOutAsync(string qrPayload, bool overstayPaid);
}
