using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPark.Domain.Entities;

namespace SmartPark.Infrastructure.Data.Configurations;

public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.HashedToken)
            .HasMaxLength(64)
            .IsRequired();

        builder.HasIndex(t => t.HashedToken);

        builder.Property(t => t.ExpiresAt).IsRequired();

        builder.Property(t => t.CreatedAt)
            .HasDefaultValueSql("now()");

        builder.HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
