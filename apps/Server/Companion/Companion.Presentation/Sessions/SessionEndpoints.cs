using Companion.Application.Sessions.Commands;
using Companion.Application.Sessions.Queries;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Companion.Presentation.Sessions;

public static class SessionEndpoints
{
    public static IEndpointRouteBuilder MapSessionEndpoints(this IEndpointRouteBuilder routes)
    {
        var sessions = routes.MapGroup("sessions").WithTags("Sessions");

        sessions
            .MapPost(
                "",
                async (CreateSessionRequest req, IMediator mediator) =>
                {
                    var id = await mediator.Send(new CreateSessionCommand(req.Name));
                    return Results.Created(
                        $"/api/sessions/{id.Value}",
                        new SessionCreatedResponse(id.Value)
                    );
                }
            )
            .WithName("CreateSession")
            .Produces<SessionCreatedResponse>(StatusCodes.Status201Created);

        sessions
            .MapGet(
                "{id:guid}",
                async (Guid id, IMediator mediator) =>
                {
                    var dto = await mediator.Send(new GetSessionQuery(new(id)));
                    return dto is null ? Results.NotFound() : Results.Ok(dto);
                }
            )
            .WithName("GetSession")
            .Produces<SessionDto>()
            .Produces(StatusCodes.Status404NotFound);

        return routes;
    }
}

record CreateSessionRequest(string? Name);

record SessionCreatedResponse(Guid Id);
