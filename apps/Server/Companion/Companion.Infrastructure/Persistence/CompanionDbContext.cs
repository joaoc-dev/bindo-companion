using Companion.Domain.Games;
using Companion.Domain.Players;
using Companion.Domain.Sessions;
using Microsoft.EntityFrameworkCore;

namespace Companion.Infrastructure.Persistence;

public class CompanionDbContext(DbContextOptions<CompanionDbContext> options) : DbContext(options)
{
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Player> Players => Set<Player>();
    public DbSet<GameDefinition> GameDefinitions => Set<GameDefinition>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CompanionDbContext).Assembly);
    }
}
