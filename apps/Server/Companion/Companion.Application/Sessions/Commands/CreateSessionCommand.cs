using Companion.Application.Common;
using Companion.Domain.Sessions;
using Companion.Domain.Sessions.Repositories;
using MediatR;

namespace Companion.Application.Sessions.Commands;

public record CreateSessionCommand(string? Name) : IRequest<SessionId>;

public class CreateSessionCommandHandler(ISessionRepository sessions, IUnitOfWork uow)
    : IRequestHandler<CreateSessionCommand, SessionId>
{
    public async Task<SessionId> Handle(CreateSessionCommand request, CancellationToken ct)
    {
        var session = Session.Create(request.Name);
        await sessions.AddAsync(session, ct);
        await uow.SaveChangesAsync(ct);
        return session.Id;
    }
}
