import type { LocalPlayer } from '@/hooks/use-players';
import { startMatch } from '@bindo/api-client/api/generated/companion/matches/matches';
import { initializeSkullKingMatch } from '@bindo/api-client/api/generated/skull-king/skull-king/skull-king';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import {
  Check,
  Copy,
  Loader2,
  Play,
  Plus,
  Skull,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreatePlayer } from '@/hooks/use-players';
import { sessionKeys, useSession } from '@/hooks/use-session';
import { GAME_SLUGS, MAX_PLAYERS, MIN_PLAYERS } from '@/lib/constants';
import { getPlayerColor, getPlayerInitial } from '@/lib/player-colors';
import { queryClient } from '@/lib/query-client';
import { addPlayerSchema } from '@/lib/schemas';

interface AddPlayerForm {
  displayName: string;
}

export function SessionLobbyPage() {
  const { sessionId } = useParams({ strict: false }) as { sessionId: string };
  const navigate = useNavigate();
  const { data: session, isLoading, error } = useSession(sessionId);
  const [players, setPlayers] = useState<LocalPlayer[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>(GAME_SLUGS.SKULL_KING);
  const [copied, setCopied] = useState(false);

  const createPlayerMutation = useCreatePlayer();

  const form = useForm<AddPlayerForm>({
    resolver: zodResolver(addPlayerSchema),
    defaultValues: { displayName: '' },
  });

  const startMatchMutation = useMutation({
    mutationFn: async () => {
      const matchRes = await startMatch(sessionId, {
        gameSlug: selectedGame,
        playerIds: players.map(p => p.id),
      });
      if (matchRes.status === 404) {
        throw new Error('Session not found');
      }
      const matchId = matchRes.data.id;

      await initializeSkullKingMatch(matchId, { playerCount: players.length });

      return matchId;
    },
    onSuccess: (matchId) => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
      void navigate({
        to: '/session/$sessionId/skull-king/$matchId',
        params: { sessionId, matchId },
      });
    },
    onError: () => {
      toast.error('Failed to start match');
    },
  });

  function handleAddPlayer(data: AddPlayerForm) {
    createPlayerMutation.mutate(data.displayName, {
      onSuccess: (player) => {
        setPlayers(prev => [...prev, player]);
        form.reset();
      },
      onError: () => {
        toast.error('Failed to add player');
      },
    });
  }

  function handleRemovePlayer(id: string) {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/session/${sessionId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(setCopied, 2000, false);
    toast.success('Session link copied');
  }

  const canStart = players.length >= MIN_PLAYERS && selectedGame;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-8">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Session not found</p>
            <Button variant="outline" className="mt-4" onClick={() => void navigate({ to: '/' })}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      {/* Session Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{session.name || 'Game Session'}</CardTitle>
            <Badge variant={session.status === 'Open' ? 'default' : 'secondary'}>
              {session.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Share:</span>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-mono"
              onClick={() => void handleCopyLink()}
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {session.pin}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <CardTitle className="text-lg">Players</CardTitle>
            <Badge variant="secondary" className="ml-auto">
              {players.length}
              /
              {MAX_PLAYERS}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {players.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {players.map((player, index) => {
                const color = getPlayerColor(index);
                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3"
                  >
                    <Avatar className="size-7">
                      <AvatarFallback className={`${color.bg} ${color.text} text-xs font-semibold`}>
                        {getPlayerInitial(player.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{player.displayName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(player.id)}
                      className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${player.displayName}`}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {players.length < MAX_PLAYERS && (
            <form onSubmit={form.handleSubmit(handleAddPlayer)} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="player-name" className="sr-only">Player name</Label>
                <Input
                  id="player-name"
                  placeholder="Player name"
                  {...form.register('displayName')}
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                disabled={createPlayerMutation.isPending}
                className="gap-1"
              >
                {createPlayerMutation.isPending
                  ? <Loader2 className="size-4 animate-spin" />
                  : <Plus className="size-4" />}
                Add
              </Button>
            </form>
          )}

          {form.formState.errors.displayName && (
            <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>
          )}

          {players.length < MIN_PLAYERS && players.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Add at least
              {' '}
              {MIN_PLAYERS - players.length}
              {' '}
              more player(s) to start.
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Game Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Select Game</h2>

        <button
          type="button"
          onClick={() => setSelectedGame(GAME_SLUGS.SKULL_KING)}
          className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
            selectedGame === GAME_SLUGS.SKULL_KING
              ? 'border-primary bg-primary/5'
              : 'border-transparent bg-card hover:border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-phase-scoring text-primary">
              <Skull className="size-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Skull King</span>
                {selectedGame === GAME_SLUGS.SKULL_KING && (
                  <Check className="size-4 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">Trick-taking pirate card game, 10 rounds</p>
            </div>
          </div>
        </button>
      </div>

      {/* Start Match */}
      <Button
        size="lg"
        className="w-full gap-2 text-base"
        disabled={!canStart || startMatchMutation.isPending}
        onClick={() => startMatchMutation.mutate()}
      >
        {startMatchMutation.isPending
          ? <Loader2 className="size-5 animate-spin" />
          : <Play className="size-5" />}
        Start Skull King Match
      </Button>
    </div>
  );
}
