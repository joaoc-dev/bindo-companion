using Companion.Domain.Common;

namespace Companion.Domain.Sessions.Events;

public record MatchStartedEvent(MatchId MatchId, SessionId SessionId, string GameSlug)
    : IDomainEvent;
