using Companion.Domain.Common;
using Companion.Domain.Sessions;

namespace Companion.SkullKing.Domain.Events;

public record RoundFinalizedEvent(MatchId MatchId, int RoundNumber) : IDomainEvent;
