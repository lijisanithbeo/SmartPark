using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPark.Infrastructure.Migrations
{
    public partial class AddOwnerIdToLocations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: add column nullable (existing rows can't reference Users yet on fresh installs)
            migrationBuilder.AddColumn<int>(
                name: "OwnerID",
                table: "ParkingLocations",
                type: "integer",
                nullable: true);

            // Step 2: assign existing rows to the first ParkingOwner user if one exists
            migrationBuilder.Sql(@"
                UPDATE ""ParkingLocations""
                SET ""OwnerID"" = (
                    SELECT ""ID"" FROM ""Users"" WHERE ""Role"" = 'ParkingOwner' ORDER BY ""ID"" LIMIT 1
                )
                WHERE ""OwnerID"" IS NULL
                  AND EXISTS (SELECT 1 FROM ""Users"" WHERE ""Role"" = 'ParkingOwner');
            ");

            // Step 3: add FK (nullable — rows may have NULL until DataSeeder runs on fresh installs)
            migrationBuilder.CreateIndex(
                name: "IX_ParkingLocations_OwnerID",
                table: "ParkingLocations",
                column: "OwnerID");

            migrationBuilder.AddForeignKey(
                name: "FK_ParkingLocations_Users_OwnerID",
                table: "ParkingLocations",
                column: "OwnerID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ParkingLocations_Users_OwnerID",
                table: "ParkingLocations");

            migrationBuilder.DropIndex(
                name: "IX_ParkingLocations_OwnerID",
                table: "ParkingLocations");

            migrationBuilder.DropColumn(
                name: "OwnerID",
                table: "ParkingLocations");
        }
    }
}
