namespace Companion.Domain.Sessions.Repositories;

public interface ISessionRepository
{
    Task<Session?> GetByIdAsync(SessionId id, CancellationToken ct = default);
    Task<Session?> GetByPinAsync(SessionPin pin, CancellationToken ct = default);
    Task AddAsync(Session session, CancellationToken ct = default);
}
