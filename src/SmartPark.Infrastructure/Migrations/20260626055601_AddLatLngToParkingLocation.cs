using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPark.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLatLngToParkingLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "ParkingLocations",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "ParkingLocations",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "ParkingLocations");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "ParkingLocations");
        }
    }
}
