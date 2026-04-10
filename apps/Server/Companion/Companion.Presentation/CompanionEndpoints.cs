using Companion.Presentation.Matches;
using Companion.Presentation.Players;
using Companion.Presentation.Sessions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace Companion.Presentation;

public static class CompanionEndpoints
{
    public static IEndpointRouteBuilder MapCompanionEndpoints(this IEndpointRouteBuilder routes)
    {
        var api = routes.MapGroup("/api");

        api.MapSessionEndpoints();
        api.MapMatchEndpoints();
        api.MapPlayerEndpoints();

        return routes;
    }
}
