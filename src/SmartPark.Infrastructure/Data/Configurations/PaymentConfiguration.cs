using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPark.Domain.Entities;

namespace SmartPark.Infrastructure.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");
        builder.HasKey(p => p.ID);

        builder.Property(p => p.Amount).IsRequired().HasColumnType("decimal(10,2)");
        builder.Property(p => p.PaymentMethod).HasConversion<string>().HasMaxLength(50);
        builder.Property(p => p.TransactionID).HasMaxLength(100);
        builder.Property(p => p.PaymentStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.PaymentDate).IsRequired();

        // Indexes for payment lookups and revenue aggregation queries
        builder.HasIndex(p => p.ReservationID);
        builder.HasIndex(p => new { p.PaymentStatus, p.PaymentDate });
    }
}
