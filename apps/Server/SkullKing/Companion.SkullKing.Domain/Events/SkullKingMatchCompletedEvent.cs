using Companion.Domain.Common;
using Companion.Domain.Players;
using Companion.Domain.Sessions;

namespace Companion.SkullKing.Domain.Events;

public record SkullKingMatchCompletedEvent(MatchId MatchId, PlayerId WinnerId) : IDomainEvent;
