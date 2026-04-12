using Companion.SkullKing.Domain.ValueObjects;

namespace Companion.SkullKing.Domain.Services;

public interface ISkullKingScoreCalculator
{
    RoundScore Calculate(Bid bid, TrickCount tricksWon, BonusCollection bonuses, int roundNumber);
}

public class SkullKingScoreCalculator : ISkullKingScoreCalculator
{
    public RoundScore Calculate(
        Bid bid,
        TrickCount tricksWon,
        BonusCollection bonuses,
        int roundNumber
    )
    {
        // Bid 0
        if (bid.Value == 0)
        {
            return tricksWon.Value == 0
                ? new RoundScore(roundNumber * 10)
                : new RoundScore(roundNumber * -10);
        }

        // Bid > 0 and correct
        if (tricksWon.Value == bid.Value)
            return new RoundScore(bid.Value * 20 + bonuses.Total);

        // Bid > 0 and wrong
        return new RoundScore(Math.Abs(tricksWon.Value - bid.Value) * -10);
    }
}
