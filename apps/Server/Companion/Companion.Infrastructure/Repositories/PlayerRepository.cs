using Companion.Domain.Players;
using Companion.Domain.Players.Repositories;
using Companion.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Companion.Infrastructure.Repositories;

public class PlayerRepository(CompanionDbContext db) : IPlayerRepository
{
    public Task<Player?> GetByIdAsync(PlayerId id, CancellationToken ct = default) =>
        db.Players.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IReadOnlyList<Player>> GetByIdsAsync(
        IEnumerable<PlayerId> ids,
        CancellationToken ct = default
    )
    {
        var idValues = ids.Select(id => id.Value).ToList();
        return await db.Players.Where(p => idValues.Contains(p.Id.Value)).ToListAsync(ct);
    }

    public async Task AddAsync(Player player, CancellationToken ct = default) =>
        await db.Players.AddAsync(player, ct);
}
