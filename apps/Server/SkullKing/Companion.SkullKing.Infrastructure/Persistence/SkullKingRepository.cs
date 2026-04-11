using Companion.Domain.Players;
using Companion.Domain.Sessions;
using Companion.SkullKing.Domain;
using Companion.SkullKing.Domain.Repositories;
using Companion.SkullKing.Domain.ValueObjects;
using Companion.SkullKing.Infrastructure.Persistence.Documents;
using MongoDB.Driver;

namespace Companion.SkullKing.Infrastructure.Persistence;

internal class SkullKingRepository(IMongoCollection<SkullKingMatchDocument> collection)
    : ISkullKingMatchRepository
{
    public async Task<SkullKingMatch?> GetByMatchIdAsync(
        MatchId matchId,
        CancellationToken ct = default
    )
    {
        var doc = await collection.Find(d => d.Id == matchId.Value).FirstOrDefaultAsync(ct);
        return doc is null ? null : ToDomain(doc);
    }

    public async Task AddAsync(SkullKingMatch match, CancellationToken ct = default) =>
        await collection.InsertOneAsync(ToDocument(match), cancellationToken: ct);

    public async Task UpdateAsync(SkullKingMatch match, CancellationToken ct = default) =>
        await collection.ReplaceOneAsync(
            d => d.Id == match.Id.Value,
            ToDocument(match),
            cancellationToken: ct
        );

    private static SkullKingMatchDocument ToDocument(SkullKingMatch match) =>
        new()
        {
            Id = match.Id.Value,
            PlayerCount = match.PlayerCount,
            TotalRounds = match.TotalRounds,
            Rounds = match
                .Rounds.Select(r => new RoundDocument
                {
                    Id = r.Id,
                    RoundNumber = r.RoundNumber,
                    Status = r.Status.ToString(),
                    Entries = r
                        .Entries.Select(e => new RoundEntryDocument
                        {
                            Id = e.Id,
                            PlayerId = e.PlayerId.Value,
                            Bid = e.Bid.Value,
                            TricksWon = e.TricksWon?.Value,
                            MermaidsCaptured = e.Bonuses?.MermaidsCaptured,
                            SkullKingCaptured = e.Bonuses?.SkullKingCaptured,
                            PiratesCapturedByMermaid = e.Bonuses?.PiratesCapturedByMermaid,
                            StandardBonuses = e.Bonuses?.StandardBonuses,
                            Score = e.Score?.Value,
                        })
                        .ToList(),
                })
                .ToList(),
        };

    private static SkullKingMatch ToDomain(SkullKingMatchDocument doc) =>
        SkullKingMatch.Rehydrate(
            new MatchId(doc.Id),
            doc.PlayerCount,
            doc.TotalRounds,
            doc.Rounds.Select(r =>
                Round.Rehydrate(
                    r.Id,
                    r.RoundNumber,
                    Enum.Parse<RoundStatus>(r.Status),
                    r.Entries.Select(e =>
                        RoundEntry.Rehydrate(
                            e.Id,
                            new PlayerId(e.PlayerId),
                            Bid.Of(e.Bid, r.RoundNumber),
                            e.TricksWon.HasValue
                                ? TrickCount.Of(e.TricksWon.Value, r.RoundNumber)
                                : null,
                            e.MermaidsCaptured.HasValue
                                ? new BonusCollection(
                                    e.MermaidsCaptured.Value,
                                    e.SkullKingCaptured!.Value,
                                    e.PiratesCapturedByMermaid!.Value,
                                    e.StandardBonuses!.Value
                                )
                                : null,
                            e.Score.HasValue ? new RoundScore(e.Score.Value) : null
                        )
                    )
                )
            )
        );
}
