using Companion.Application.Common;

namespace Companion.Infrastructure.Persistence;

public class UnitOfWork(CompanionDbContext db) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}
