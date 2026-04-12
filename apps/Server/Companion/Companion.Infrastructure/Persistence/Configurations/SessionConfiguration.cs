using Companion.Domain.Games;
using Companion.Domain.Sessions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Companion.Infrastructure.Persistence.Configurations;

public class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.ToTable("sessions");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasConversion(id => id.Value, value => new SessionId(value));

        builder.Property(s => s.Name).HasMaxLength(100);

        builder.OwnsOne(
            s => s.Pin,
            pin =>
            {
                pin.Property(p => p.Value).HasColumnName("pin").HasMaxLength(6).IsRequired();
                pin.HasIndex(p => p.Value).IsUnique();
            }
        );

        builder.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasMany(s => s.Matches).WithOne().HasForeignKey(m => m.SessionId);

        builder.Ignore(s => s.DomainEvents);
    }
}
