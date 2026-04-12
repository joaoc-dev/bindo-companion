using Companion.Application.Sessions.Commands;
using Companion.Domain.Players;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Companion.Presentation.Matches;

public static class MatchEndpoints
{
    public static IEndpointRouteBuilder MapMatchEndpoints(this IEndpointRouteBuilder routes)
    {
        var sessions = routes.MapGroup("sessions");

        sessions
            .MapPost(
                "{id:guid}/matches",
                async (Guid id, StartMatchRequest req, IMediator mediator) =>
                {
                    var matchId = await mediator.Send(
                        new StartMatchCommand(
                            new(id),
                            req.GameSlug,
                            req.PlayerIds.Select(p => new PlayerId(p)).ToList()
                        )
                    );
                    return Results.Created(
                        $"/api/matches/{matchId.Value}",
                        new MatchCreatedResponse(matchId.Value)
                    );
                }
            )
            .WithName("StartMatch")
            .WithTags("Matches")
            .Produces<MatchCreatedResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status404NotFound);

        return routes;
    }
}

record StartMatchRequest(string GameSlug, List<Guid> PlayerIds);

record MatchCreatedResponse(Guid Id);
