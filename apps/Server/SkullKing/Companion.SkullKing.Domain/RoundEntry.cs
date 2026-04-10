using Companion.Domain.Common;
using Companion.Domain.Players;
using Companion.SkullKing.Domain.ValueObjects;

namespace Companion.SkullKing.Domain;

public class RoundEntry : Entity<Guid>
{
    public PlayerId PlayerId { get; private set; } = default!;
    public Bid Bid { get; private set; } = default!;
    public TrickCount? TricksWon { get; private set; }
    public BonusCollection? Bonuses { get; private set; }
    public RoundScore? Score { get; private set; }

    public bool IsComplete => TricksWon is not null;

    private RoundEntry() { }

    internal static RoundEntry PlaceBid(PlayerId playerId, Bid bid) =>
        new() { Id = Guid.NewGuid(), PlayerId = playerId, Bid = bid };

    internal void Complete(TrickCount tricksWon, BonusCollection bonuses, RoundScore score)
    {
        TricksWon = tricksWon;
        Bonuses = bonuses;
        Score = score;
    }

    public static RoundEntry Rehydrate(Guid id, PlayerId playerId, Bid bid, TrickCount? tricksWon, BonusCollection? bonuses, RoundScore? score) =>
        new()
        {
            Id = id,
            PlayerId = playerId,
            Bid = bid,
            TricksWon = tricksWon,
            Bonuses = bonuses,
            Score = score
        };
}
