using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPark.Domain.Entities;

namespace SmartPark.Infrastructure.Data.Configurations;

public class ParkingLocationConfiguration : IEntityTypeConfiguration<ParkingLocation>
{
    public void Configure(EntityTypeBuilder<ParkingLocation> builder)
    {
        builder.ToTable("ParkingLocations");
        builder.HasKey(l => l.ID);

        builder.Property(l => l.LocationName).IsRequired().HasMaxLength(100);
        builder.Property(l => l.Address).IsRequired().HasMaxLength(500);
        builder.Property(l => l.City).IsRequired().HasMaxLength(100);
        builder.Property(l => l.TotalSlots).IsRequired();
        builder.Property(l => l.CreatedDate).IsRequired();
        builder.Property(l => l.IsActive).IsRequired();

        builder.Property(l => l.OwnerID).IsRequired(false);

        builder.HasOne(l => l.Owner)
               .WithMany(u => u.OwnedLocations)
               .HasForeignKey(l => l.OwnerID)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(l => l.OwnerID);

        builder.HasMany(l => l.ParkingSlots)
               .WithOne(s => s.Location)
               .HasForeignKey(s => s.LocationID)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
