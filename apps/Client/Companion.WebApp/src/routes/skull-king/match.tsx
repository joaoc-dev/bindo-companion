import type { LocalPlayer } from '@/hooks/use-players';
import type { MatchPhase } from '@/lib/constants';
import type { BonusInput } from '@/lib/scoring';
import { Link, useParams } from '@tanstack/react-router';
import { BarChart3, Loader2, Play, SkipForward } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useReducer } from 'react';
import { toast } from 'sonner';
import { BidEntry } from '@/components/skull-king/bid-entry';
import { GamePhaseBanner } from '@/components/skull-king/game-phase-banner';
import { ResultEntry } from '@/components/skull-king/result-entry';
import { RoundStepper } from '@/components/skull-king/round-stepper';
import { RoundSummaryCard } from '@/components/skull-king/round-summary-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSession } from '@/hooks/use-session';
import { useFinalizeRound, usePlaceBid, useScoreboard, useSubmitResult } from '@/hooks/use-skull-king';
import { MATCH_PHASE, TOTAL_ROUNDS } from '@/lib/constants';

interface MatchState {
  phase: MatchPhase;
  currentRound: number;
  completedRounds: number;
  bids: Record<string, number>;
  results: Record<string, { tricksWon: number; score: number }>;
  pendingPlayer: string | null;
}

type MatchAction
  = | { type: 'BID_PLACED'; playerId: string; bid: number }
    | { type: 'ADVANCE_TO_PLAYING' }
    | { type: 'ADVANCE_TO_SCORING' }
    | { type: 'RESULT_SUBMITTED'; playerId: string; tricksWon: number; score: number }
    | { type: 'ADVANCE_TO_REVIEW' }
    | { type: 'ROUND_FINALIZED' }
    | { type: 'NEXT_ROUND' }
    | { type: 'GAME_OVER' }
    | { type: 'SET_PENDING'; playerId: string | null };

function matchReducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case 'BID_PLACED':
      return {
        ...state,
        bids: { ...state.bids, [action.playerId]: action.bid },
        pendingPlayer: null,
      };
    case 'ADVANCE_TO_PLAYING':
      return { ...state, phase: MATCH_PHASE.PLAYING };
    case 'ADVANCE_TO_SCORING':
      return { ...state, phase: MATCH_PHASE.SCORING };
    case 'RESULT_SUBMITTED':
      return {
        ...state,
        results: {
          ...state.results,
          [action.playerId]: { tricksWon: action.tricksWon, score: action.score },
        },
        pendingPlayer: null,
      };
    case 'ADVANCE_TO_REVIEW':
      return { ...state, phase: MATCH_PHASE.REVIEW };
    case 'ROUND_FINALIZED':
      return {
        ...state,
        completedRounds: state.currentRound,
      };
    case 'NEXT_ROUND':
      return {
        ...state,
        phase: MATCH_PHASE.BIDDING,
        currentRound: state.currentRound + 1,
        bids: {},
        results: {},
        pendingPlayer: null,
      };
    case 'GAME_OVER':
      return { ...state, phase: MATCH_PHASE.GAME_OVER };
    case 'SET_PENDING':
      return { ...state, pendingPlayer: action.playerId };
    default:
      return state;
  }
}

export function SkullKingMatchPage() {
  const params = useParams({ strict: false }) as { sessionId: string; matchId: string };
  const { sessionId, matchId } = params;

  const { data: session } = useSession(sessionId);
  useScoreboard(matchId);

  const currentMatch = session?.matches.find(m => m.matchId === matchId);
  const players: LocalPlayer[] = currentMatch?.players.map(p => ({
    id: p.playerId,
    displayName: p.displayName,
  })) ?? [];

  const [state, dispatch] = useReducer(matchReducer, {
    phase: MATCH_PHASE.BIDDING,
    currentRound: 1,
    completedRounds: 0,
    bids: {},
    results: {},
    pendingPlayer: null,
  });

  const placeBidMutation = usePlaceBid();
  const submitResultMutation = useSubmitResult();
  const finalizeRoundMutation = useFinalizeRound();

  const handleBid = useCallback((playerId: string, bid: number) => {
    dispatch({ type: 'SET_PENDING', playerId });
    placeBidMutation.mutate(
      { matchId, roundNumber: state.currentRound, playerId, bid },
      {
        onSuccess: () => dispatch({ type: 'BID_PLACED', playerId, bid }),
        onError: () => {
          dispatch({ type: 'SET_PENDING', playerId: null });
          toast.error('Failed to place bid');
        },
      },
    );
  }, [matchId, state.currentRound, placeBidMutation]);

  const handleResult = useCallback((playerId: string, result: { tricksWon: number } & BonusInput) => {
    dispatch({ type: 'SET_PENDING', playerId });
    submitResultMutation.mutate(
      { matchId, roundNumber: state.currentRound, playerId, ...result },
      {
        onSuccess: (res) => {
          const score = res.data.score as number;
          dispatch({ type: 'RESULT_SUBMITTED', playerId, tricksWon: result.tricksWon, score });
        },
        onError: () => {
          dispatch({ type: 'SET_PENDING', playerId: null });
          toast.error('Failed to submit result');
        },
      },
    );
  }, [matchId, state.currentRound, submitResultMutation]);

  const handleFinalize = useCallback(() => {
    finalizeRoundMutation.mutate(
      { matchId, roundNumber: state.currentRound },
      {
        onSuccess: () => {
          dispatch({ type: 'ROUND_FINALIZED' });
          if (state.currentRound >= TOTAL_ROUNDS) {
            dispatch({ type: 'GAME_OVER' });
          }
        },
        onError: () => toast.error('Failed to finalize round'),
      },
    );
  }, [matchId, state.currentRound, finalizeRoundMutation]);

  const allBidsPlaced = players.length > 0 && players.every(p => p.id in state.bids);
  const allResultsSubmitted = players.length > 0 && players.every(p => p.id in state.results);

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <RoundStepper currentRound={state.currentRound} completedRounds={state.completedRounds} />
        <Link
          to="/session/$sessionId/skull-king/$matchId/scoreboard"
          params={{ sessionId, matchId }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <BarChart3 className="size-4" />
          Scores
        </Link>
      </div>

      <GamePhaseBanner phase={state.phase} roundNumber={state.currentRound} />

      {/* Phase Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${state.phase}-${state.currentRound}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* BIDDING */}
          {state.phase === MATCH_PHASE.BIDDING && (
            <div className="space-y-2">
              {players.map((player, i) => (
                <BidEntry
                  key={player.id}
                  player={player}
                  seatIndex={i}
                  roundNumber={state.currentRound}
                  onBidConfirmed={handleBid}
                  isPending={state.pendingPlayer === player.id}
                  isConfirmed={player.id in state.bids}
                  confirmedBid={state.bids[player.id]}
                />
              ))}
              {allBidsPlaced && (
                <Button
                  className="w-full gap-2"
                  onClick={() => dispatch({ type: 'ADVANCE_TO_PLAYING' })}
                >
                  <Play className="size-4" />
                  All Bids In -- Play Round
                </Button>
              )}
            </div>
          )}

          {/* PLAYING */}
          {state.phase === MATCH_PHASE.PLAYING && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="mb-3 text-center text-sm text-muted-foreground">
                    Play round
                    {' '}
                    {state.currentRound}
                    {' '}
                    with your cards. Here are the bids:
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-right">Bid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {players.map(player => (
                        <TableRow key={player.id}>
                          <TableCell className="text-sm">{player.displayName}</TableCell>
                          <TableCell className="text-right font-score font-semibold">
                            {state.bids[player.id]}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Button
                className="w-full gap-2"
                onClick={() => dispatch({ type: 'ADVANCE_TO_SCORING' })}
              >
                <SkipForward className="size-4" />
                Done Playing -- Enter Results
              </Button>
            </div>
          )}

          {/* SCORING */}
          {state.phase === MATCH_PHASE.SCORING && (
            <div className="space-y-3">
              {players.map((player, i) => (
                <ResultEntry
                  key={player.id}
                  player={player}
                  seatIndex={i}
                  roundNumber={state.currentRound}
                  bid={state.bids[player.id] ?? 0}
                  onSubmit={handleResult}
                  isPending={state.pendingPlayer === player.id}
                  isSubmitted={player.id in state.results}
                  submittedScore={state.results[player.id]?.score}
                />
              ))}
              {allResultsSubmitted && (
                <Button
                  className="w-full"
                  onClick={() => dispatch({ type: 'ADVANCE_TO_REVIEW' })}
                >
                  Review Round
                </Button>
              )}
            </div>
          )}

          {/* REVIEW */}
          {state.phase === MATCH_PHASE.REVIEW && (
            <div className="space-y-4">
              <RoundSummaryCard
                roundNumber={state.currentRound}
                players={players}
                bids={state.bids}
                results={state.results}
              />
              {state.completedRounds < state.currentRound
                ? (
                    <Button
                      className="w-full gap-2"
                      onClick={handleFinalize}
                      disabled={finalizeRoundMutation.isPending}
                    >
                      {finalizeRoundMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                      Finalize Round
                      {' '}
                      {state.currentRound}
                    </Button>
                  )
                : state.currentRound < TOTAL_ROUNDS
                  ? (
                      <Button
                        className="w-full gap-2"
                        onClick={() => dispatch({ type: 'NEXT_ROUND' })}
                      >
                        <SkipForward className="size-4" />
                        Next Round
                      </Button>
                    )
                  : null}
            </div>
          )}

          {/* GAME OVER */}
          {state.phase === MATCH_PHASE.GAME_OVER && (
            <div className="space-y-4 text-center">
              <Card>
                <CardContent className="py-8">
                  <h2 className="text-2xl font-bold">Game Over!</h2>
                  <p className="mt-2 text-muted-foreground">All 10 rounds completed.</p>
                </CardContent>
              </Card>
              <Link
                to="/session/$sessionId/skull-king/$matchId/scoreboard"
                params={{ sessionId, matchId }}
              >
                <Button size="lg" className="w-full gap-2 text-base">
                  <BarChart3 className="size-5" />
                  View Final Scoreboard
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
