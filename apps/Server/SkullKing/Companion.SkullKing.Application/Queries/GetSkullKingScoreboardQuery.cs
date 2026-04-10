using Companion.Domain.Sessions;
using Companion.SkullKing.Domain;
using Companion.SkullKing.Domain.Repositories;
using MediatR;

namespace Companion.SkullKing.Application.Queries;

public record RoundEntryDto(Guid PlayerId, int Bid, int TricksWon, int Score);
public record RoundDto(int RoundNumber, string Status, IReadOnlyList<RoundEntryDto> Entries);
public record PlayerTotalDto(Guid PlayerId, int Total);

public record SkullKingScoreboardDto(
    Guid MatchId,
    IReadOnlyList<RoundDto> Rounds,
    IReadOnlyList<PlayerTotalDto> Totals);

public record GetSkullKingScoreboardQuery(MatchId MatchId) : IRequest<SkullKingScoreboardDto?>;

public class GetSkullKingScoreboardQueryHandler(ISkullKingMatchRepository repository)
    : IRequestHandler<GetSkullKingScoreboardQuery, SkullKingScoreboardDto?>
{
    public async Task<SkullKingScoreboardDto?> Handle(GetSkullKingScoreboardQuery request, CancellationToken ct)
    {
        var match = await repository.GetByMatchIdAsync(request.MatchId, ct);
        if (match is null) return null;

        var rounds = match.Rounds.Select(r => new RoundDto(
            r.RoundNumber,
            r.Status.ToString(),
            r.Entries.Select(e => new RoundEntryDto(e.PlayerId.Value, e.Bid.Value, e.TricksWon.Value, e.Score.Value)).ToList()
        )).ToList();

        var totals = match.GetTotals()
            .Select(kv => new PlayerTotalDto(kv.Key.Value, kv.Value))
            .OrderByDescending(p => p.Total)
            .ToList();

        return new SkullKingScoreboardDto(request.MatchId.Value, rounds, totals);
    }
}
