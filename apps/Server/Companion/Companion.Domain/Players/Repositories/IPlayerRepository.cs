namespace Companion.Domain.Players.Repositories;

public interface IPlayerRepository
{
    Task<Player?> GetByIdAsync(PlayerId id, CancellationToken ct = default);
    Task<IReadOnlyList<Player>> GetByIdsAsync(
        IEnumerable<PlayerId> ids,
        CancellationToken ct = default
    );
    Task AddAsync(Player player, CancellationToken ct = default);
}
