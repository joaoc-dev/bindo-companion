using Companion.Application.Common;
using Companion.Domain.Games.Repositories;
using Companion.Domain.Players;
using Companion.Domain.Players.Repositories;
using Companion.Domain.Sessions;
using Companion.Domain.Sessions.Repositories;
using MediatR;

namespace Companion.Application.Sessions.Commands;

public record StartMatchCommand(
    SessionId SessionId,
    string GameSlug,
    IReadOnlyList<PlayerId> PlayerIds
) : IRequest<MatchId>;

public class StartMatchCommandHandler(
    ISessionRepository sessions,
    IGameDefinitionRepository games,
    IPlayerRepository players,
    IUnitOfWork uow,
    IPublisher publisher)
    : IRequestHandler<StartMatchCommand, MatchId>
{
    public async Task<MatchId> Handle(StartMatchCommand request, CancellationToken ct)
    {
        var session = await sessions.GetByIdAsync(request.SessionId, ct)
            ?? throw new InvalidOperationException($"Session {request.SessionId.Value} not found.");

        var game = await games.GetBySlugAsync(request.GameSlug, ct)
            ?? throw new InvalidOperationException($"Game '{request.GameSlug}' not found.");

        var playerList = await players.GetByIdsAsync(request.PlayerIds, ct);
        var playerData = playerList.Select(p => (p.Id, p.DisplayName)).ToList();

        var match = session.StartMatch(game.Id, game.Slug, playerData);

        await uow.SaveChangesAsync(ct);

        foreach (var domainEvent in session.DomainEvents)
            await publisher.Publish(domainEvent, ct);

        session.ClearDomainEvents();

        return match.Id;
    }
}
