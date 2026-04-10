using Companion.Application.Common;
using Companion.Domain.Players;
using Companion.Domain.Players.Repositories;
using MediatR;

namespace Companion.Application.Players.Commands;

public record CreatePlayerCommand(string DisplayName) : IRequest<PlayerId>;

public class CreatePlayerCommandHandler(IPlayerRepository players, IUnitOfWork uow)
    : IRequestHandler<CreatePlayerCommand, PlayerId>
{
    public async Task<PlayerId> Handle(CreatePlayerCommand request, CancellationToken ct)
    {
        var player = Player.CreateAnonymous(request.DisplayName);
        await players.AddAsync(player, ct);
        await uow.SaveChangesAsync(ct);
        return player.Id;
    }
}
