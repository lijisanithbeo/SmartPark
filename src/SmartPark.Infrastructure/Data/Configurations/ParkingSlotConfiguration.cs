using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPark.Domain.Entities;

namespace SmartPark.Infrastructure.Data.Configurations;

public class ParkingSlotConfiguration : IEntityTypeConfiguration<ParkingSlot>
{
    public void Configure(EntityTypeBuilder<ParkingSlot> builder)
    {
        builder.ToTable("ParkingSlots");
        builder.HasKey(s => s.ID);

        builder.Property(s => s.SlotNumber).IsRequired().HasMaxLength(20);
        builder.Property(s => s.FloorNumber).IsRequired();
        builder.Property(s => s.SlotType).HasConversion<string>().HasMaxLength(20);
        builder.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(s => s.HourlyRate).HasColumnType("decimal(10,2)").IsRequired().HasDefaultValue(50m);
        builder.Property(s => s.CreatedDate).IsRequired();
        builder.Property(s => s.ModifiedDate);

        // Rule: SlotNumber must be unique within a location
        builder.HasIndex(s => new { s.LocationID, s.SlotNumber }).IsUnique();

        builder.HasMany(s => s.Reservations)
               .WithOne(r => r.ParkingSlot)
               .HasForeignKey(r => r.SlotID)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
