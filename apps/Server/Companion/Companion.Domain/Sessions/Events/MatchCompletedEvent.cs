using Companion.Domain.Common;

namespace Companion.Domain.Sessions.Events;

public record MatchCompletedEvent(MatchId MatchId, SessionId SessionId) : IDomainEvent;
