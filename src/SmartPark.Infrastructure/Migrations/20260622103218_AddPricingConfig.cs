using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SmartPark.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPricingConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PricingConfigs",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LocationID = table.Column<int>(type: "integer", nullable: false),
                    NormalRate = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    WeekdayPeakEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    WeekdayPeakStartHour = table.Column<int>(type: "integer", nullable: false),
                    WeekdayPeakEndHour = table.Column<int>(type: "integer", nullable: false),
                    WeekdayPeakRate = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    WeekendPeakEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    WeekendPeakStartHour = table.Column<int>(type: "integer", nullable: false),
                    WeekendPeakEndHour = table.Column<int>(type: "integer", nullable: false),
                    WeekendPeakRate = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PricingConfigs", x => x.ID);
                    table.ForeignKey(
                        name: "FK_PricingConfigs_ParkingLocations_LocationID",
                        column: x => x.LocationID,
                        principalTable: "ParkingLocations",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PricingConfigs_LocationID",
                table: "PricingConfigs",
                column: "LocationID",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PricingConfigs");
        }
    }
}
