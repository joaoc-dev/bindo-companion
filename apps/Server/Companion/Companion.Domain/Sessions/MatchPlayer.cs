using Companion.Domain.Players;

namespace Companion.Domain.Sessions;

public record MatchPlayer(PlayerId PlayerId, string DisplayName, int SeatOrder);
