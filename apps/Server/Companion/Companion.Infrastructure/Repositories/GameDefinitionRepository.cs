using Companion.Domain.Games;
using Companion.Domain.Games.Repositories;
using Companion.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Companion.Infrastructure.Repositories;

public class GameDefinitionRepository(CompanionDbContext db) : IGameDefinitionRepository
{
    public Task<GameDefinition?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        db.GameDefinitions.FirstOrDefaultAsync(g => g.Slug == slug && g.IsActive, ct);

    public async Task<IReadOnlyList<GameDefinition>> GetAllActiveAsync(CancellationToken ct = default) =>
        await db.GameDefinitions.Where(g => g.IsActive).ToListAsync(ct);

    public async Task AddAsync(GameDefinition game, CancellationToken ct = default) =>
        await db.GameDefinitions.AddAsync(game, ct);
}
