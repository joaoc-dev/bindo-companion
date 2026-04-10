using Companion.Application.Players.Commands;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Companion.Presentation.Players;

public static class PlayerEndpoints
{
    public static IEndpointRouteBuilder MapPlayerEndpoints(this IEndpointRouteBuilder routes)
    {
        var players = routes.MapGroup("players").WithTags("Players");

        players.MapPost("", async (CreatePlayerRequest req, IMediator mediator) =>
        {
            var id = await mediator.Send(new CreatePlayerCommand(req.DisplayName));
            return Results.Created($"/api/players/{id.Value}", new PlayerCreatedResponse(id.Value));
        })
        .WithName("CreatePlayer")
        .Produces<PlayerCreatedResponse>(StatusCodes.Status201Created);

        return routes;
    }
}

record CreatePlayerRequest(string DisplayName);
record PlayerCreatedResponse(Guid Id);
