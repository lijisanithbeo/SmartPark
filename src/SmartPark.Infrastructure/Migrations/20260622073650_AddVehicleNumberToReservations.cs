using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPark.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleNumberToReservations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VehicleNumber",
                table: "Reservations",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VehicleNumber",
                table: "Reservations");
        }
    }
}
