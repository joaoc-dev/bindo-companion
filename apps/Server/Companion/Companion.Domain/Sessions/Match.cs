using Companion.Domain.Common;
using Companion.Domain.Games;
using Companion.Domain.Players;

namespace Companion.Domain.Sessions;

public class Match : Entity<MatchId>
{
    public SessionId SessionId { get; private set; } = default!;
    public GameId GameId { get; private set; } = default!;
    public string GameSlug { get; private set; } = string.Empty;
    public MatchStatus Status { get; private set; }
    public DateTimeOffset StartedAt { get; private set; }
    public DateTimeOffset? CompletedAt { get; private set; }

    private readonly List<MatchPlayer> _players = [];
    public IReadOnlyList<MatchPlayer> Players => _players.AsReadOnly();

    private Match() { }

    internal static Match Create(
        SessionId sessionId,
        GameId gameId,
        string gameSlug,
        IEnumerable<(PlayerId PlayerId, string DisplayName)> players
    )
    {
        var match = new Match
        {
            Id = MatchId.New(),
            SessionId = sessionId,
            GameId = gameId,
            GameSlug = gameSlug,
            Status = MatchStatus.InProgress,
            StartedAt = DateTimeOffset.UtcNow,
        };

        var seat = 1;
        foreach (var (playerId, displayName) in players)
            match._players.Add(new MatchPlayer(playerId, displayName, seat++));

        return match;
    }

    internal void Complete()
    {
        if (Status != MatchStatus.InProgress)
            throw new InvalidOperationException("Only in-progress matches can be completed.");

        Status = MatchStatus.Completed;
        CompletedAt = DateTimeOffset.UtcNow;
    }

    internal void Abandon()
    {
        if (Status != MatchStatus.InProgress)
            throw new InvalidOperationException("Only in-progress matches can be abandoned.");

        Status = MatchStatus.Abandoned;
        CompletedAt = DateTimeOffset.UtcNow;
    }
}
