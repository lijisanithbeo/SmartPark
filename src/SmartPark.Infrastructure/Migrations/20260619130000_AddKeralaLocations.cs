using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPark.Infrastructure.Migrations
{
    public partial class AddKeralaLocations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── Lulu Mall Kochi ───────────────────────────────────────────────
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingLocations"" (""LocationName"", ""Address"", ""City"", ""TotalSlots"", ""CreatedDate"", ""IsActive"")
                VALUES ('Lulu Mall Kochi Parking', 'Edapally, NH Bypass', 'Kochi', 10, NOW(), true);
            ");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'G001', 0, 'Car', 50.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Lulu Mall Kochi Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'G002', 0, 'Car', 50.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Lulu Mall Kochi Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'G003', 0, 'Car', 50.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Lulu Mall Kochi Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'G004', 0, 'Car', 50.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Lulu Mall Kochi Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'G005', 0, 'Car', 50.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Lulu Mall Kochi Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'H001', 1, 'Bike', 20.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Lulu Mall Kochi Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'H002', 1, 'Bike', 20.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Lulu Mall Kochi Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'H003', 1, 'Bike', 20.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Lulu Mall Kochi Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'H004', 1, 'Bike', 20.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Lulu Mall Kochi Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'H005', 1, 'Bike', 20.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Lulu Mall Kochi Parking';");

            // ── Cochin International Airport ───────────────────────────────────
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingLocations"" (""LocationName"", ""Address"", ""City"", ""TotalSlots"", ""CreatedDate"", ""IsActive"")
                VALUES ('Cochin International Airport Parking', 'Nedumbassery, Angamaly', 'Kochi', 6, NOW(), true);
            ");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'I001', 0, 'Car', 90.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Cochin International Airport Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'I002', 0, 'Car', 90.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Cochin International Airport Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'I003', 0, 'Car', 90.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Cochin International Airport Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'J001', 1, 'Bike', 35.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Cochin International Airport Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'J002', 1, 'Bike', 35.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Cochin International Airport Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'J003', 1, 'Bike', 35.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Cochin International Airport Parking';");

            // ── MG Road Ernakulam ──────────────────────────────────────────────
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingLocations"" (""LocationName"", ""Address"", ""City"", ""TotalSlots"", ""CreatedDate"", ""IsActive"")
                VALUES ('MG Road Ernakulam Parking', 'MG Road, Ernakulam', 'Kochi', 8, NOW(), true);
            ");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'K001', 0, 'Car', 40.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'MG Road Ernakulam Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'K002', 0, 'Car', 40.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'MG Road Ernakulam Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'K003', 0, 'Car', 40.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'MG Road Ernakulam Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'K004', 0, 'Car', 40.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'MG Road Ernakulam Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'L001', 1, 'Bike', 15.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'MG Road Ernakulam Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'L002', 1, 'Bike', 15.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'MG Road Ernakulam Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'L003', 1, 'Bike', 15.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'MG Road Ernakulam Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'L004', 1, 'Bike', 15.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'MG Road Ernakulam Parking';");

            // ── Trivandrum Central ─────────────────────────────────────────────
            migrationBuilder.Sql(@"
                INSERT INTO ""ParkingLocations"" (""LocationName"", ""Address"", ""City"", ""TotalSlots"", ""CreatedDate"", ""IsActive"")
                VALUES ('Trivandrum Central Station Parking', 'Thampanoor, Central Railway Station', 'Thiruvananthapuram', 6, NOW(), true);
            ");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'M001', 0, 'Car', 45.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Trivandrum Central Station Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'M002', 0, 'Car', 45.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Trivandrum Central Station Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'M003', 0, 'Car', 45.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Trivandrum Central Station Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'N001', 1, 'Bike', 18.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Trivandrum Central Station Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'N002', 1, 'Bike', 18.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Trivandrum Central Station Parking';");
            migrationBuilder.Sql(@"INSERT INTO ""ParkingSlots"" (""LocationID"", ""SlotNumber"", ""FloorNumber"", ""SlotType"", ""HourlyRate"", ""Status"", ""CreatedDate"") SELECT ""ID"", 'N003', 1, 'Bike', 18.00, 'Available', NOW() FROM ""ParkingLocations"" WHERE ""LocationName"" = 'Trivandrum Central Station Parking';");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""ParkingLocations"" WHERE ""City"" IN ('Kochi', 'Thiruvananthapuram') AND ""LocationName"" LIKE '%Parking%';");
        }
    }
}
