import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { AppShell } from '@/components/layout/app-shell';
import { HomePage } from '@/routes/home';
import { SessionLobbyPage } from '@/routes/session-lobby';
import { SkullKingMatchPage } from '@/routes/skull-king/match';
import { SkullKingScoreboardPage } from '@/routes/skull-king/scoreboard';

const rootRoute = createRootRoute({
  component: AppShell,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/session/$sessionId',
  component: SessionLobbyPage,
});

const skullKingMatchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/session/$sessionId/skull-king/$matchId',
  component: SkullKingMatchPage,
});

const skullKingScoreboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/session/$sessionId/skull-king/$matchId/scoreboard',
  component: SkullKingScoreboardPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  sessionRoute,
  skullKingMatchRoute,
  skullKingScoreboardRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
