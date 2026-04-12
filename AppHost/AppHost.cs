using Aspire.Hosting.ApplicationModel;

var builder = DistributedApplication.CreateBuilder(args);

// Stable host port + credentials so `dotnet ef` and GUI clients match appsettings.Development.json.
// Port 5433 avoids colliding with a PostgreSQL service already bound to 5432 on the machine.
// Pass user/password into AddPostgres so the server never uses Aspire's random default password.
// Persistent lifetime: some container runtimes (e.g. Rancher Desktop) fail the AppHost Npgsql health
// probe for session-scoped containers so the dashboard stays "Unhealthy" even when PG logs look fine.
// WithDataVolume: data survives restarts; POSTGRES_PASSWORD applies only on first init — if you change
// credentials or inherit a bad volume, `docker volume rm bindo-companion-postgres` once.
// Parameter names avoid "postgres-password": Aspire may have persisted a generated password
// in AppHost user secrets under Parameters:postgres-password, which overrides AddParameter defaults.
var postgresUsername = builder.AddParameter(
    "bindo-postgres-username",
    "postgres",
    publishValueAsDefault: false,
    secret: false
);
var postgresPassword = builder.AddParameter(
    "bindo-postgres-password",
    "postgres",
    publishValueAsDefault: false,
    secret: false
);

var postgres = builder
    .AddPostgres("postgres", postgresUsername, postgresPassword, port: 5434)
    .WithLifetime(ContainerLifetime.Persistent)
    .WithDataVolume("bindo-companion-postgres")
    .WithPgAdmin();
var db = postgres.AddDatabase("companion");

var mongoUsername = builder.AddParameter(
    "bindo-mongo-username",
    "admin",
    publishValueAsDefault: false,
    secret: false
);
var mongoPassword = builder.AddParameter(
    "bindo-mongo-password",
    "admin",
    publishValueAsDefault: false,
    secret: false
);

var mongo = builder
    .AddMongoDB("skull-king-mongo", port: 27017, userName: mongoUsername, password: mongoPassword)
    .WithLifetime(ContainerLifetime.Persistent)
    .WithDataVolume("bindo-companion-mongo");

var companionApi = builder
    .AddProject<Projects.Companion_Presentation>("companion-api")
    .WithReference(db)
    .WaitFor(postgres)
    .WithExternalHttpEndpoints();

var skullKingApi = builder
    .AddProject<Projects.Companion_SkullKing_Presentation>("skull-king-api")
    .WithReference(mongo)
    .WithExternalHttpEndpoints();

var companionOpenApi = companionApi.GetEndpoint("http");
var skullKingOpenApi = skullKingApi.GetEndpoint("http");

// Polls OpenAPI + runs Orval when specs change (same idea as patchnuts apiWatcher).
var apiWatcher = builder
    .AddJavaScriptApp("api-watcher", "..")
    .WithNpm()
    .WithRunScript("watch:api")
    .WithEnvironment(
        "COMPANION_OPENAPI_URL",
        ReferenceExpression.Create($"{companionOpenApi}/openapi/v1.json")
    )
    .WithEnvironment(
        "SKULL_KING_OPENAPI_URL",
        ReferenceExpression.Create($"{skullKingOpenApi}/openapi/v1.json")
    )
    .WithReference(companionApi)
    .WaitFor(companionApi)
    .WithReference(skullKingApi)
    .WaitFor(skullKingApi);

var webfrontend = builder
    .AddViteApp("webfrontend", "../apps/Client/Companion.WebApp")
    .WithReference(companionApi)
    .WithReference(skullKingApi)
    .WaitFor(companionApi)
    .WaitFor(skullKingApi)
    .WaitFor(apiWatcher);

builder.Build().Run();
