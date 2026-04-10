using Companion.SkullKing.Application.Commands;
using Companion.SkullKing.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Companion.SkullKing.Presentation;

public static class SkullKingEndpoints
{
    public static IEndpointRouteBuilder MapSkullKingEndpoints(this IEndpointRouteBuilder routes)
    {
        var sk = routes.MapGroup("/api/skull-king").WithTags("Skull King");

        sk.MapPost("{matchId:guid}/initialize", async (Guid matchId, InitializeSkullKingRequest req, IMediator mediator) =>
        {
            await mediator.Send(new InitializeSkullKingMatchCommand(new(matchId), req.PlayerCount));
            return Results.NoContent();
        })
        .WithName("InitializeSkullKingMatch")
        .Produces(StatusCodes.Status204NoContent);

        sk.MapPost("{matchId:guid}/rounds/{roundNumber:int}/bids", async (
            Guid matchId, int roundNumber, PlaceBidRequest req, IMediator mediator) =>
        {
            await mediator.Send(new PlaceBidCommand(new(matchId), roundNumber, new(req.PlayerId), req.Bid));
            return Results.NoContent();
        })
        .WithName("PlaceBid")
        .Produces(StatusCodes.Status204NoContent);

        sk.MapPost("{matchId:guid}/rounds/{roundNumber:int}/results", async (
            Guid matchId, int roundNumber, SubmitResultRequest req, IMediator mediator) =>
        {
            var score = await mediator.Send(new SubmitRoundResultCommand(
                new(matchId), roundNumber, new(req.PlayerId),
                req.TricksWon,
                req.MermaidsCaptured, req.SkullKingCaptured,
                req.PiratesCapturedByMermaid, req.StandardBonuses));
            return Results.Ok(new RoundResultResponse(score));
        })
        .WithName("SubmitRoundResult")
        .Produces<RoundResultResponse>();

        sk.MapPost("{matchId:guid}/rounds/{roundNumber:int}/finalize", async (Guid matchId, int roundNumber, IMediator mediator) =>
        {
            await mediator.Send(new FinalizeRoundCommand(new(matchId), roundNumber));
            return Results.NoContent();
        })
        .WithName("FinalizeRound")
        .Produces(StatusCodes.Status204NoContent);

        sk.MapGet("{matchId:guid}/scoreboard", async (Guid matchId, IMediator mediator) =>
        {
            var dto = await mediator.Send(new GetSkullKingScoreboardQuery(new(matchId)));
            return dto is null ? Results.NotFound() : Results.Ok(dto);
        })
        .WithName("GetSkullKingScoreboard")
        .Produces<SkullKingScoreboardDto>()
        .Produces(StatusCodes.Status404NotFound);

        return routes;
    }
}

record InitializeSkullKingRequest(int PlayerCount);
record PlaceBidRequest(Guid PlayerId, int Bid);
record SubmitResultRequest(
    Guid PlayerId, int TricksWon,
    int MermaidsCaptured, int SkullKingCaptured,
    int PiratesCapturedByMermaid, int StandardBonuses);
record RoundResultResponse(int Score);
