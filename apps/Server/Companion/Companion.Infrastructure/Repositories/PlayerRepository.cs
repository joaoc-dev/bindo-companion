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
        var idList = ids.ToList();
        return await db.Players.Where(p => idList.Contains(p.Id)).ToListAsync(ct);
    }

    public async Task AddAsync(Player player, CancellationToken ct = default) =>
        await db.Players.AddAsync(player, ct);
}
