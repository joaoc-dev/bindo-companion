using Companion.Domain.Common;

namespace Companion.Domain.Games;

public class GameDefinition : AggregateRoot<GameId>
{
    public string Slug { get; private set; }
    public string DisplayName { get; private set; }
    public int MinPlayers { get; private set; }
    public int MaxPlayers { get; private set; }
    public bool IsActive { get; private set; }

    private GameDefinition() { Slug = string.Empty; DisplayName = string.Empty; }

    public static GameDefinition Create(string slug, string displayName, int minPlayers, int maxPlayers)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(slug);
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);

        return new GameDefinition
        {
            Id = GameId.New(),
            Slug = slug.ToLowerInvariant(),
            DisplayName = displayName,
            MinPlayers = minPlayers,
            MaxPlayers = maxPlayers,
            IsActive = true
        };
    }

    public void Deactivate() => IsActive = false;
}
