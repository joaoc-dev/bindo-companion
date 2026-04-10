using Companion.Domain.Sessions;

namespace Companion.SkullKing.Domain.Repositories;

public interface ISkullKingMatchRepository
{
    Task<SkullKingMatch?> GetByMatchIdAsync(MatchId matchId, CancellationToken ct = default);
    Task AddAsync(SkullKingMatch match, CancellationToken ct = default);
    Task UpdateAsync(SkullKingMatch match, CancellationToken ct = default);
}
