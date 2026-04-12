namespace Companion.Domain.Sessions;

public record SessionPin
{
    private static readonly Random _rng = Random.Shared;
    private const string Chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public string Value { get; }

    private SessionPin(string value) => Value = value;

    public static SessionPin Generate()
    {
        var chars = Enumerable.Range(0, 6).Select(_ => Chars[_rng.Next(Chars.Length)]).ToArray();
        return new SessionPin(new string(chars));
    }

    public static SessionPin From(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length != 6)
            throw new ArgumentException("Pin must be exactly 6 characters.", nameof(value));

        return new SessionPin(value.ToUpperInvariant());
    }
}
