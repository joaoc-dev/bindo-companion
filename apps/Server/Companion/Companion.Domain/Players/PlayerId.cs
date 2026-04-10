namespace Companion.Domain.Players;

public record PlayerId(Guid Value)
{
    public static PlayerId New() => new(Guid.NewGuid());
}
