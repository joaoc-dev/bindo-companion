using Companion.Domain.Sessions;
using Companion.SkullKing.Domain.Repositories;
using MediatR;

namespace Companion.SkullKing.Application.Commands;

public record FinalizeRoundCommand(MatchId MatchId, int RoundNumber) : IRequest;

public class FinalizeRoundCommandHandler(ISkullKingMatchRepository repository)
    : IRequestHandler<FinalizeRoundCommand>
{
    public async Task Handle(FinalizeRoundCommand request, CancellationToken ct)
    {
        var match =
            await repository.GetByMatchIdAsync(request.MatchId, ct)
            ?? throw new InvalidOperationException(
                $"SkullKing match {request.MatchId.Value} not found."
            );

        match.FinalizeRound(request.RoundNumber);
        await repository.UpdateAsync(match, ct);
    }
}
