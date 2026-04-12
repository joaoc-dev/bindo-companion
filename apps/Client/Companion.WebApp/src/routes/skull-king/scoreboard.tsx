import { Link, useParams } from '@tanstack/react-router';
import { ArrowLeft, Crown, Trophy } from 'lucide-react';
import { ScoreTable } from '@/components/skull-king/score-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/hooks/use-session';
import { useScoreboard } from '@/hooks/use-skull-king';
import { TOTAL_ROUNDS } from '@/lib/constants';
import { getPlayerColor, getPlayerInitial } from '@/lib/player-colors';
import { cn } from '@/lib/utils';

const podiumStyles = [
  'border-yellow-400/50 bg-yellow-50',
  'border-purple-300/50 bg-purple-50',
  'border-emerald-300/50 bg-emerald-50',
] as const;

export function SkullKingScoreboardPage() {
  const params = useParams({ strict: false }) as { sessionId: string; matchId: string };
  const { sessionId, matchId } = params;

  const { data: session } = useSession(sessionId);
  const { data: scoreboard, isLoading } = useScoreboard(matchId);

  const currentMatch = session?.matches.find(m => m.matchId === matchId);
  const playersMap = new Map(
    currentMatch?.players.map(p => [p.playerId, p.displayName]) ?? [],
  );

  if (isLoading || !scoreboard) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const completedRounds = scoreboard.rounds.filter(
    r => r.status === 'Finalized',
  ).length;
  const isGameOver = completedRounds >= TOTAL_ROUNDS;

  const ranked = [...scoreboard.totals]
    .sort((a, b) => (b.total as number) - (a.total as number));

  const players = ranked.map(t => ({
    playerId: t.playerId,
    displayName: playersMap.get(t.playerId) ?? t.playerId,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/session/$sessionId/skull-king/$matchId"
            params={{ sessionId, matchId }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold">Scoreboard</h1>
        </div>
        {isGameOver && (
          <Badge className="gap-1 bg-yellow-100 text-yellow-800">
            <Trophy className="size-3" />
            Game Over
          </Badge>
        )}
      </div>

      {/* Leaderboard Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {ranked.slice(0, 3).map((entry, rank) => {
          const displayName = playersMap.get(entry.playerId) ?? entry.playerId;
          const seatIndex = currentMatch?.players.findIndex(p => p.playerId === entry.playerId) ?? 0;
          const color = getPlayerColor(seatIndex);

          return (
            <Card
              key={entry.playerId}
              className={cn(
                'border-2',
                podiumStyles[rank] ?? 'border-border',
              )}
            >
              <CardContent className="flex items-center gap-3 py-4">
                <div className="relative">
                  <Avatar className="size-10">
                    <AvatarFallback className={`${color.bg} ${color.text} font-semibold`}>
                      {getPlayerInitial(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  {rank === 0 && (
                    <Crown className="absolute -top-2 -right-1 size-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {rank === 0 ? '1st' : rank === 1 ? '2nd' : '3rd'}
                  </p>
                </div>
                <span className="font-score text-xl font-bold">
                  {entry.total as number}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Score Matrix */}
      <Card>
        <CardContent className="pt-4">
          <ScoreTable
            players={players}
            rounds={scoreboard.rounds.map(r => ({
              roundNumber: r.roundNumber as number,
              entries: r.entries.map(e => ({
                playerId: e.playerId,
                score: e.score as number | null,
              })),
            }))}
            totals={scoreboard.totals.map(t => ({
              playerId: t.playerId,
              total: t.total as number,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
