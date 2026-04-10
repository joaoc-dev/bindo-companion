var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume("bindo-companion-postgres")
    .WithPgAdmin();
var db = postgres.AddDatabase("companion");

var mongo = builder.AddMongoDB("skull-king-mongo")
    .WithDataVolume("bindo-companion-mongo");

var companionApi = builder.AddProject<Projects.Companion_Presentation>("companion-api")
    .WithReference(db)
    .WaitFor(postgres)
    .WithExternalHttpEndpoints();

var skullKingApi = builder.AddProject<Projects.Companion_SkullKing_Presentation>("skull-king-api")
    .WithReference(mongo)
    .WithExternalHttpEndpoints();

var webfrontend = builder.AddViteApp("webfrontend", "../apps/Client/Companion.WebApp")
    .WithReference(companionApi)
    .WithReference(skullKingApi)
    .WaitFor(companionApi)
    .WaitFor(skullKingApi);

builder.Build().Run();
