using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPark.Domain.Entities;

namespace SmartPark.Infrastructure.Data.Configurations;

public class PricingConfigConfiguration : IEntityTypeConfiguration<PricingConfig>
{
    public void Configure(EntityTypeBuilder<PricingConfig> builder)
    {
        builder.ToTable("PricingConfigs");
        builder.HasKey(p => p.ID);

        builder.Property(p => p.NormalRate).HasPrecision(18, 2).IsRequired();
        builder.Property(p => p.WeekdayPeakRate).HasPrecision(18, 2);
        builder.Property(p => p.WeekendPeakRate).HasPrecision(18, 2);

        builder.HasOne(p => p.Location)
               .WithOne()
               .HasForeignKey<PricingConfig>(p => p.LocationID)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.LocationID).IsUnique();
    }
}
