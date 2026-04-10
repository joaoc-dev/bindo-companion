namespace Companion.Domain.Games;

public record GameId(Guid Value)
{
    public static GameId New() => new(Guid.NewGuid());
}
