using Companion.Domain.Players;
using Companion.Domain.Sessions;
using Companion.SkullKing.Domain.Repositories;
using Companion.SkullKing.Domain.Services;
using Companion.SkullKing.Domain.ValueObjects;
using MediatR;

namespace Companion.SkullKing.Application.Commands;

public record SubmitRoundResultCommand(
    MatchId MatchId,
    int RoundNumber,
    PlayerId PlayerId,
    int TricksWon,
    int MermaidsCaptured,
    int SkullKingCaptured,
    int PiratesCapturedByMermaid,
    int StandardBonuses
) : IRequest<int>;

public class SubmitRoundResultCommandHandler(
    ISkullKingMatchRepository repository,
    ISkullKingScoreCalculator calculator
) : IRequestHandler<SubmitRoundResultCommand, int>
{
    public async Task<int> Handle(SubmitRoundResultCommand request, CancellationToken ct)
    {
        var match =
            await repository.GetByMatchIdAsync(request.MatchId, ct)
            ?? throw new InvalidOperationException(
                $"SkullKing match {request.MatchId.Value} not found."
            );

        var tricks = TrickCount.Of(request.TricksWon, request.RoundNumber);
        var bonuses = new BonusCollection(
            request.MermaidsCaptured,
            request.SkullKingCaptured,
            request.PiratesCapturedByMermaid,
            request.StandardBonuses
        );

        var score = match.SubmitResult(
            request.RoundNumber,
            request.PlayerId,
            tricks,
            bonuses,
            calculator
        );
        await repository.UpdateAsync(match, ct);
        return score.Value;
    }
}
