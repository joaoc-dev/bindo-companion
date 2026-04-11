using Companion.Application.Common;
using Companion.Domain.Games.Repositories;
using Companion.Domain.Players.Repositories;
using Companion.Domain.Sessions.Repositories;
using Companion.Infrastructure.Persistence;
using Companion.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Companion.Infrastructure;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        string connectionString
    )
    {
        services.AddDbContext<CompanionDbContext>(options => options.UseNpgsql(connectionString));

        services.AddScoped<IUnitOfWork>(sp => new UnitOfWork(
            sp.GetRequiredService<CompanionDbContext>()
        ));
        services.AddScoped<ISessionRepository, SessionRepository>();
        services.AddScoped<IPlayerRepository, PlayerRepository>();
        services.AddScoped<IGameDefinitionRepository, GameDefinitionRepository>();

        return services;
    }
}
