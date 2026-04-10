using Companion.Domain.Players.Repositories;
using Companion.Domain.Sessions;
using Companion.Domain.Sessions.Repositories;
using MediatR;

namespace Companion.Application.Sessions.Queries;

public record SessionMatchPlayerDto(Guid PlayerId, string DisplayName, int SeatOrder);

public record SessionMatchDto(
    Guid MatchId,
    string GameSlug,
    string Status,
    DateTimeOffset StartedAt,
    DateTimeOffset? CompletedAt,
    IReadOnlyList<SessionMatchPlayerDto> Players);

public record SessionDto(
    Guid SessionId,
    string? Name,
    string Pin,
    string Status,
    DateTimeOffset CreatedAt,
    IReadOnlyList<SessionMatchDto> Matches);

public record GetSessionQuery(SessionId SessionId) : IRequest<SessionDto?>;

public class GetSessionQueryHandler(ISessionRepository sessions)
    : IRequestHandler<GetSessionQuery, SessionDto?>
{
    public async Task<SessionDto?> Handle(GetSessionQuery request, CancellationToken ct)
    {
        var session = await sessions.GetByIdAsync(request.SessionId, ct);
        if (session is null) return null;

        return new SessionDto(
            session.Id.Value,
            session.Name,
            session.Pin.Value,
            session.Status.ToString(),
            session.CreatedAt,
            session.Matches.Select(m => new SessionMatchDto(
                m.Id.Value,
                m.GameSlug,
                m.Status.ToString(),
                m.StartedAt,
                m.CompletedAt,
                m.Players.Select(p => new SessionMatchPlayerDto(p.PlayerId.Value, p.DisplayName, p.SeatOrder)).ToList()
            )).ToList()
        );
    }
}
