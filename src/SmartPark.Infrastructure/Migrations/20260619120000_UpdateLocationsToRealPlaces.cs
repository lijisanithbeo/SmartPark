using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPark.Infrastructure.Migrations
{
    public partial class UpdateLocationsToRealPlaces : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update existing locations to real Chennai addresses
            migrationBuilder.Sql(@"
                UPDATE ""ParkingLocations""
                SET ""LocationName"" = 'Express Avenue Mall Parking',
                    ""Address""      = '49, Whites Road, Royapettah',
                    ""City""         = 'Chennai'
                WHERE ""ID"" = 1;
            ");

            migrationBuilder.Sql(@"
                UPDATE ""ParkingLocations""
                SET ""LocationName"" = 'Chennai International Airport Parking',
                    ""Address""      = 'Airport Road, Tirusulam',
                    ""City""         = 'Chennai'
                WHERE ""ID"" = 2;
            ");

            // Add third location: Phoenix MarketCity
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingLocations"" (""LocationName"", ""Address"", ""City"", ""TotalSlots"", ""CreatedDate"", ""IsActive"")
                VALUES ('Phoenix MarketCity Parking', '142, Velachery Main Road, Velachery', 'Chennai', 8, NOW(), true);
            ");

            // Add Car + Bike slots for Phoenix MarketCity (separate statements for PostgreSQL)
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"")
                SELECT ""ID"", 'E001', 0, 'Car', 60.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Phoenix MarketCity Parking';
            ");
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"")
                SELECT ""ID"", 'E002', 0, 'Car', 60.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Phoenix MarketCity Parking';
            ");
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"")
                SELECT ""ID"", 'E003', 0, 'Car', 60.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Phoenix MarketCity Parking';
            ");
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"")
                SELECT ""ID"", 'E004', 0, 'Car', 60.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Phoenix MarketCity Parking';
            ");
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"")
                SELECT ""ID"", 'F001', 1, 'Bike', 25.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Phoenix MarketCity Parking';
            ");
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"")
                SELECT ""ID"", 'F002', 1, 'Bike', 25.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Phoenix MarketCity Parking';
            ");
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"")
                SELECT ""ID"", 'F003', 1, 'Bike', 25.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Phoenix MarketCity Parking';
            ");
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"")
                SELECT ""ID"", 'F004', 1, 'Bike', 25.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Phoenix MarketCity Parking';
            ");

            // Update Airport slot rates to reflect premium pricing
            migrationBuilder.Sql(@"UPDATE ""ParkingSlots"" SET ""HourlyRate"" = 80.00 WHERE ""LocationID"" = 2 AND ""SlotType"" = 'Car';");
            migrationBuilder.Sql(@"UPDATE ""ParkingSlots"" SET ""HourlyRate"" = 30.00 WHERE ""LocationID"" = 2 AND ""SlotType"" = 'Bike';");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ""ParkingLocations""
                SET ""LocationName"" = 'Downtown SmartPark',
                    ""Address""      = '12, Anna Salai',
                    ""City""         = 'Chennai'
                WHERE ""ID"" = 1;

                UPDATE ""ParkingLocations""
                SET ""LocationName"" = 'Airport SmartPark',
                    ""Address""      = 'Terminal 1, GST Road',
                    ""City""         = 'Chennai'
                WHERE ""ID"" = 2;

                DELETE FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Phoenix MarketCity Parking';
            ");
        }
    }
}
