using Companion.Domain.Common;
using Companion.Domain.Players;
using Companion.SkullKing.Domain.ValueObjects;

namespace Companion.SkullKing.Domain;

public class Round : Entity<Guid>
{
    public int RoundNumber { get; private set; }
    public RoundStatus Status { get; private set; }

    private readonly List<RoundEntry> _entries = [];
    public IReadOnlyList<RoundEntry> Entries => _entries.AsReadOnly();

    private Round() { }

    internal static Round Create(int roundNumber) =>
        new() { Id = Guid.NewGuid(), RoundNumber = roundNumber, Status = RoundStatus.Open };

    public static Round Rehydrate(Guid id, int roundNumber, RoundStatus status, IEnumerable<RoundEntry> entries)
    {
        var round = new Round { Id = id, RoundNumber = roundNumber, Status = status };
        round._entries.AddRange(entries);
        return round;
    }

    internal void PlaceBid(PlayerId playerId, Bid bid)
    {
        if (Status != RoundStatus.Open)
            throw new InvalidOperationException("Round is not open for bidding.");

        var existing = _entries.FirstOrDefault(e => e.PlayerId == playerId);
        if (existing is not null)
            _entries.Remove(existing);

        _entries.Add(RoundEntry.PlaceBid(playerId, bid));
    }

    internal void SubmitResult(PlayerId playerId, TrickCount tricksWon, BonusCollection bonuses, RoundScore score)
    {
        if (Status != RoundStatus.Open)
            throw new InvalidOperationException("Round is not open for entries.");

        var entry = _entries.FirstOrDefault(e => e.PlayerId == playerId)
            ?? throw new InvalidOperationException($"No bid found for player {playerId.Value} in round {RoundNumber}.");

        entry.Complete(tricksWon, bonuses, score);
    }

    internal void Finalize()
    {
        if (Status != RoundStatus.Open)
            throw new InvalidOperationException("Round is already finalized.");

        Status = RoundStatus.Finalized;
    }
}
