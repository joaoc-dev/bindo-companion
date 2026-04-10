using Companion.Domain.Sessions;
using Companion.SkullKing.Domain;
using Companion.SkullKing.Domain.Repositories;
using MediatR;

namespace Companion.SkullKing.Application.Commands;

public record InitializeSkullKingMatchCommand(MatchId MatchId, int PlayerCount) : IRequest;

public class InitializeSkullKingMatchCommandHandler(ISkullKingMatchRepository repository)
    : IRequestHandler<InitializeSkullKingMatchCommand>
{
    public async Task Handle(InitializeSkullKingMatchCommand request, CancellationToken ct)
    {
        var match = SkullKingMatch.Initialize(request.MatchId, request.PlayerCount);
        await repository.AddAsync(match, ct);
    }
}
