using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPark.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_SlotID",
                table: "Reservations");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Role",
                table: "Users",
                column: "Role");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_ReservationDate",
                table: "Reservations",
                column: "ReservationDate");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_SlotID_Status",
                table: "Reservations",
                columns: new[] { "SlotID", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaymentStatus_PaymentDate",
                table: "Payments",
                columns: new[] { "PaymentStatus", "PaymentDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Role",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_ReservationDate",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_SlotID_Status",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Payments_PaymentStatus_PaymentDate",
                table: "Payments");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_SlotID",
                table: "Reservations",
                column: "SlotID");
        }
    }
}
