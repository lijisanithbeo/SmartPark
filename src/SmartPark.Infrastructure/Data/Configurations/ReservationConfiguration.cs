using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPark.Domain.Entities;

namespace SmartPark.Infrastructure.Data.Configurations;

public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.ToTable("Reservations");
        builder.HasKey(r => r.ID);

        builder.Property(r => r.ReservationDate).IsRequired();
        builder.Property(r => r.StartTime).IsRequired();
        builder.Property(r => r.EndTime).IsRequired();
        builder.Property(r => r.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(r => r.User)
               .WithMany(u => u.Reservations)
               .HasForeignKey(r => r.UserID)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Payment)
               .WithOne(p => p.Reservation)
               .HasForeignKey<Payment>(p => p.ReservationID)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
