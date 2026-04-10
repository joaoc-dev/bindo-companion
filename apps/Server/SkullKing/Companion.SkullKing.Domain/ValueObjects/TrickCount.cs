namespace Companion.SkullKing.Domain.ValueObjects;

public record TrickCount
{
    public int Value { get; }

    private TrickCount(int value) => Value = value;

    public static TrickCount Of(int value, int roundNumber)
    {
        if (value < 0 || value > roundNumber)
            throw new ArgumentOutOfRangeException(nameof(value),
                $"Trick count must be between 0 and {roundNumber}.");
        return new TrickCount(value);
    }
}
