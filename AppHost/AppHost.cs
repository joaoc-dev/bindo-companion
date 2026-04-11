using Aspire.Hosting.ApplicationModel;

var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder
    .AddPostgres("postgres")
    .WithDataVolume("bindo-companion-postgres")
    .WithPgAdmin();
var db = postgres.AddDatabase("companion");

var mongo = builder.AddMongoDB("skull-king-mongo").WithDataVolume("bindo-companion-mongo");

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
