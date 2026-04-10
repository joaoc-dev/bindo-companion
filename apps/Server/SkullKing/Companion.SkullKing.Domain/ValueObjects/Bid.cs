namespace Companion.SkullKing.Domain.ValueObjects;

public record Bid
{
    public int Value { get; }

    private Bid(int value) => Value = value;

    public static Bid Of(int value, int roundNumber)
    {
        if (value < 0 || value > roundNumber)
            throw new ArgumentOutOfRangeException(nameof(value),
                $"Bid must be between 0 and {roundNumber} for round {roundNumber}.");
        return new Bid(value);
    }
}
