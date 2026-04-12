using Companion.Domain.Games;
using Companion.Domain.Players;
using Companion.Domain.Sessions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Companion.Infrastructure.Persistence.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.ToTable("matches");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasConversion(id => id.Value, value => new MatchId(value));

        builder
            .Property(m => m.SessionId)
            .HasConversion(id => id.Value, value => new SessionId(value));

        builder.Property(m => m.GameId).HasConversion(id => id.Value, value => new GameId(value));

        builder.Property(m => m.GameSlug).HasMaxLength(50).IsRequired();

        builder.Property(m => m.Status).HasConversion<string>().HasMaxLength(20);

        builder.OwnsMany(
            m => m.Players,
            mp =>
            {
                mp.ToTable("match_players");
                mp.WithOwner().HasForeignKey("MatchId");
                mp.Property(p => p.PlayerId)
                    .HasConversion(id => id.Value, value => new PlayerId(value));
                mp.Property(p => p.DisplayName).HasMaxLength(100);
            }
        );
    }
}
