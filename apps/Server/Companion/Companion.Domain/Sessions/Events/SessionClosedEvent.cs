using Companion.Domain.Common;

namespace Companion.Domain.Sessions.Events;

public record SessionClosedEvent(SessionId SessionId) : IDomainEvent;
