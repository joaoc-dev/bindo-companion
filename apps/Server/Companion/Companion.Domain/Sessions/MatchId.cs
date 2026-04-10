namespace Companion.Domain.Sessions;

public record MatchId(Guid Value)
{
    public static MatchId New() => new(Guid.NewGuid());
}
