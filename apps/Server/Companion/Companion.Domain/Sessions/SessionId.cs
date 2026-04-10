namespace Companion.Domain.Sessions;

public record SessionId(Guid Value)
{
    public static SessionId New() => new(Guid.NewGuid());
}
