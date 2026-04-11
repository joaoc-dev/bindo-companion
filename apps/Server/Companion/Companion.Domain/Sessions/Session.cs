using Companion.Domain.Common;
using Companion.Domain.Games;
using Companion.Domain.Players;
using Companion.Domain.Sessions.Events;

namespace Companion.Domain.Sessions;

public class Session : AggregateRoot<SessionId>
{
    public string? Name { get; private set; }
    public SessionPin Pin { get; private set; } = default!;
    public SessionStatus Status { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private readonly List<Match> _matches = [];
    public IReadOnlyList<Match> Matches => _matches.AsReadOnly();

    private Session() { }

    public static Session Create(string? name = null)
    {
        var session = new Session
        {
            Id = SessionId.New(),
            Name = name,
            Pin = SessionPin.Generate(),
            Status = SessionStatus.Open,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        return session;
    }

    public Match StartMatch(
        GameId gameId,
        string gameSlug,
        IEnumerable<(PlayerId PlayerId, string DisplayName)> players
    )
    {
        if (Status != SessionStatus.Open)
            throw new InvalidOperationException("Cannot start a match in a closed session.");

        var match = Match.Create(Id, gameId, gameSlug, players);
        _matches.Add(match);
        Raise(new MatchStartedEvent(match.Id, Id, gameSlug));
        return match;
    }

    public void CompleteMatch(MatchId matchId)
    {
        var match = GetMatch(matchId);
        match.Complete();
        Raise(new MatchCompletedEvent(matchId, Id));
    }

    public void AbandonMatch(MatchId matchId)
    {
        var match = GetMatch(matchId);
        match.Abandon();
    }

    public void Close()
    {
        if (Status == SessionStatus.Closed)
            throw new InvalidOperationException("Session is already closed.");

        Status = SessionStatus.Closed;
        Raise(new SessionClosedEvent(Id));
    }

    private Match GetMatch(MatchId matchId) =>
        _matches.FirstOrDefault(m => m.Id == matchId)
        ?? throw new InvalidOperationException($"Match {matchId.Value} not found in session.");
}
