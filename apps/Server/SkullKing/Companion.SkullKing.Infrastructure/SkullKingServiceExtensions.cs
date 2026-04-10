using Companion.SkullKing.Domain.Repositories;
using Companion.SkullKing.Domain.Services;
using Companion.SkullKing.Infrastructure.Persistence;
using Companion.SkullKing.Infrastructure.Persistence.Documents;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

namespace Companion.SkullKing.Infrastructure;

public static class SkullKingServiceExtensions
{
    public static IServiceCollection AddSkullKing(this IServiceCollection services, string connectionString, string databaseName = "skull_king")
    {
        services.AddSingleton<IMongoClient>(_ => new MongoClient(connectionString));

        services.AddSingleton(sp =>
            sp.GetRequiredService<IMongoClient>()
              .GetDatabase(databaseName)
              .GetCollection<SkullKingMatchDocument>("skull_king_matches"));

        services.AddScoped<ISkullKingMatchRepository, SkullKingRepository>();
        services.AddScoped<ISkullKingScoreCalculator, SkullKingScoreCalculator>();

        return services;
    }
}
