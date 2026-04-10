using Companion.Domain.Games;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Companion.Infrastructure.Persistence.Configurations;

public class GameDefinitionConfiguration : IEntityTypeConfiguration<GameDefinition>
{
    public void Configure(EntityTypeBuilder<GameDefinition> builder)
    {
        builder.ToTable("game_definitions");

        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id)
            .HasConversion(id => id.Value, value => new GameId(value));

        builder.Property(g => g.Slug)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(g => g.Slug).IsUnique();

        builder.Property(g => g.DisplayName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Ignore(g => g.DomainEvents);
    }
}
