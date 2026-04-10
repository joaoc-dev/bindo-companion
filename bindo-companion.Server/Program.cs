using MediatR;
using Companion.Application.Common;
using Companion.Application.Players.Commands;
using Companion.Application.Sessions.Commands;
using Companion.Application.Sessions.Queries;
using Companion.Infrastructure;
using Companion.Infrastructure.Persistence;
using Companion.SkullKing.Application.Commands;
using Companion.SkullKing.Application.Queries;
using Companion.SkullKing.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("companion")
    ?? throw new InvalidOperationException("Connection string 'companion' not found.");

var mongoConnectionString = builder.Configuration.GetConnectionString("skull-king-mongo")
    ?? throw new InvalidOperationException("Connection string 'skull-king-mongo' not found.");

builder.Services.AddInfrastructure(connectionString);
builder.Services.AddSkullKing(mongoConnectionString);

builder.Services.AddScoped<IUnitOfWork>(sp => new CompositeUnitOfWork(
    sp.GetRequiredService<CompanionDbContext>()));

builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(CreateSessionCommand).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(InitializeSkullKingMatchCommand).Assembly);
});

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// ----- Endpoints -----
var api = app.MapGroup("/api");

// Sessions
api.MapPost("sessions", async (CreateSessionRequest req, IMediator mediator) =>
{
    var id = await mediator.Send(new CreateSessionCommand(req.Name));
    return Results.Created($"/api/sessions/{id.Value}", new { id = id.Value });
});

api.MapGet("sessions/{id:guid}", async (Guid id, IMediator mediator) =>
{
    var dto = await mediator.Send(new GetSessionQuery(new(id)));
    return dto is null ? Results.NotFound() : Results.Ok(dto);
});

api.MapPost("sessions/{id:guid}/matches", async (Guid id, StartMatchRequest req, IMediator mediator) =>
{
    var matchId = await mediator.Send(new StartMatchCommand(
        new(id),
        req.GameSlug,
        req.PlayerIds.Select(p => new Companion.Domain.Players.PlayerId(p)).ToList()));
    return Results.Created($"/api/matches/{matchId.Value}", new { id = matchId.Value });
});

// Players
api.MapPost("players", async (CreatePlayerRequest req, IMediator mediator) =>
{
    var id = await mediator.Send(new CreatePlayerCommand(req.DisplayName));
    return Results.Created($"/api/players/{id.Value}", new { id = id.Value });
});

// Skull King
var sk = api.MapGroup("skull-king");

sk.MapPost("{matchId:guid}/initialize", async (Guid matchId, InitializeSkullKingRequest req, IMediator mediator) =>
{
    await mediator.Send(new InitializeSkullKingMatchCommand(new(matchId), req.PlayerCount));
    return Results.NoContent();
});

sk.MapPost("{matchId:guid}/rounds/{roundNumber:int}/entries", async (
    Guid matchId, int roundNumber, SubmitEntryRequest req, IMediator mediator) =>
{
    var score = await mediator.Send(new SubmitRoundEntryCommand(
        new(matchId), roundNumber, new(req.PlayerId),
        req.Bid, req.TricksWon,
        req.MermaidsCaptured, req.SkullKingCaptured,
        req.PiratesCapturedByMermaid, req.StandardBonuses));
    return Results.Ok(new { score });
});

sk.MapPost("{matchId:guid}/rounds/{roundNumber:int}/finalize", async (Guid matchId, int roundNumber, IMediator mediator) =>
{
    await mediator.Send(new FinalizeRoundCommand(new(matchId), roundNumber));
    return Results.NoContent();
});

sk.MapGet("{matchId:guid}/scoreboard", async (Guid matchId, IMediator mediator) =>
{
    var dto = await mediator.Send(new GetSkullKingScoreboardQuery(new(matchId)));
    return dto is null ? Results.NotFound() : Results.Ok(dto);
});

app.MapDefaultEndpoints();
app.UseFileServer();
app.Run();

// ----- Request Models -----
record CreateSessionRequest(string? Name);
record StartMatchRequest(string GameSlug, List<Guid> PlayerIds);
record CreatePlayerRequest(string DisplayName);
record InitializeSkullKingRequest(int PlayerCount);
record SubmitEntryRequest(
    Guid PlayerId, int Bid, int TricksWon,
    int MermaidsCaptured, int SkullKingCaptured,
    int PiratesCapturedByMermaid, int StandardBonuses);

// ----- Composition root helpers -----
sealed class CompositeUnitOfWork(CompanionDbContext appDb) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        appDb.SaveChangesAsync(ct);
}
