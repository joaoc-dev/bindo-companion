using Companion.Domain.Common;

namespace Companion.Domain.Players;

public class Player : AggregateRoot<PlayerId>
{
    public string DisplayName { get; private set; }
    public bool IsAnonymous { get; private set; }
    public Guid? UserId { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private Player() { DisplayName = string.Empty; }

    public static Player CreateAnonymous(string displayName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);

        return new Player
        {
            Id = PlayerId.New(),
            DisplayName = displayName,
            IsAnonymous = true,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Rename(string newDisplayName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(newDisplayName);
        DisplayName = newDisplayName;
    }

    public void LinkToUser(Guid userId)
    {
        UserId = userId;
        IsAnonymous = false;
    }
}
