namespace Companion.Domain.Games.Repositories;

public interface IGameDefinitionRepository
{
    Task<GameDefinition?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<IReadOnlyList<GameDefinition>> GetAllActiveAsync(CancellationToken ct = default);
    Task AddAsync(GameDefinition game, CancellationToken ct = default);
}
