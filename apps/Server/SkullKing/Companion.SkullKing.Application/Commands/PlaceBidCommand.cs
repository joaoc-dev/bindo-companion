using Companion.Domain.Players;
using Companion.Domain.Sessions;
using Companion.SkullKing.Domain.Repositories;
using Companion.SkullKing.Domain.ValueObjects;
using MediatR;

namespace Companion.SkullKing.Application.Commands;

public record PlaceBidCommand(
    MatchId MatchId,
    int RoundNumber,
    PlayerId PlayerId,
    int Bid
) : IRequest;

public class PlaceBidCommandHandler(ISkullKingMatchRepository repository)
    : IRequestHandler<PlaceBidCommand>
{
    public async Task Handle(PlaceBidCommand request, CancellationToken ct)
    {
        var match = await repository.GetByMatchIdAsync(request.MatchId, ct)
            ?? throw new InvalidOperationException($"SkullKing match {request.MatchId.Value} not found.");

        var bid = Bid.Of(request.Bid, request.RoundNumber);
        match.PlaceBid(request.RoundNumber, request.PlayerId, bid);
        await repository.UpdateAsync(match, ct);
    }
}
