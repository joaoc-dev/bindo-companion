using Companion.Domain.Sessions;
using Companion.Domain.Sessions.Repositories;
using Companion.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Companion.Infrastructure.Repositories;

public class SessionRepository(CompanionDbContext db) : ISessionRepository
{
    public Task<Session?> GetByIdAsync(SessionId id, CancellationToken ct = default) =>
        db.Sessions.Include("_matches").FirstOrDefaultAsync(s => s.Id == id, ct);

    public Task<Session?> GetByPinAsync(SessionPin pin, CancellationToken ct = default) =>
        db.Sessions.Include("_matches").FirstOrDefaultAsync(s => s.Pin.Value == pin.Value, ct);

    public async Task AddAsync(Session session, CancellationToken ct = default) =>
        await db.Sessions.AddAsync(session, ct);
}
