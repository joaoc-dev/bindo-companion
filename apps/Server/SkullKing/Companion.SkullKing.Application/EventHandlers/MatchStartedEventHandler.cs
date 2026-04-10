using Companion.Domain.Sessions.Events;
using MediatR;

namespace Companion.SkullKing.Application.EventHandlers;

public class MatchStartedEventHandler : INotificationHandler<MatchStartedEvent>
{
    private const string Slug = "skull-king";

    public async Task Handle(MatchStartedEvent notification, CancellationToken ct)
    {
        if (notification.GameSlug != Slug) return;

        // PlayerCount comes from the session match — we need it here.
        // For now we pass it via a separate command after StartMatch provides it.
        // This handler triggers initialization; caller must ensure player count is passed.
    }
}
