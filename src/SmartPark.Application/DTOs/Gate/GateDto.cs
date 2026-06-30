namespace SmartPark.Application.DTOs.Gate;

public record GateScanResultDto(
    int      ReservationId,
    string   CustomerName,
    string   SlotNumber,
    string   LocationName,
    string   City,
    DateTime StartTime,
    DateTime EndTime,
    string   Status,
    string?  VehicleNumber,
    bool     IsCheckedIn,
    bool     IsCheckedOut,
    DateTime? CheckInTime,
    DateTime? CheckOutTime,
    int      OverstayMinutes,
    decimal  OverstayPenalty,
    bool     OverstayPaid
);

public record GateCheckInDto(
    int      ReservationId,
    DateTime CheckInTime,
    string   SlotNumber,
    string   LocationName,
    string   CustomerName,
    string   Message
);

public record GateCheckOutDto(
    int      ReservationId,
    DateTime CheckOutTime,
    int      OverstayMinutes,
    decimal  OverstayPenalty,
    bool     OverstayPaid,
    bool     HasOverstay,
    string   Message
);

public record GateActionRequest(string QrPayload);
public record GateCheckOutRequest(string QrPayload, bool OverstayPaid);
