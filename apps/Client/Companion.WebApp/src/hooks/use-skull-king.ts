import type { SubmitResultRequest } from '@bindo/api-client/api/generated/skull-king/models';
import {
  finalizeRound,
  getSkullKingScoreboard,
  initializeSkullKingMatch,
  placeBid,
  submitRoundResult,
} from '@bindo/api-client/api/generated/skull-king/skull-king/skull-king';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export const skullKingKeys = {
  all: ['skull-king'] as const,
  scoreboard: (matchId: string) => [...skullKingKeys.all, 'scoreboard', matchId] as const,
};

export function useScoreboard(matchId: string, enabled = true) {
  return useQuery({
    queryKey: skullKingKeys.scoreboard(matchId),
    queryFn: async () => {
      const res = await getSkullKingScoreboard(matchId);
      if (res.status === 404) {
        throw new Error('Scoreboard not found');
      }
      return res.data;
    },
    enabled,
    refetchInterval: 10_000,
  });
}

export function useInitializeMatch() {
  return useMutation({
    mutationFn: ({ matchId, playerCount }: { matchId: string; playerCount: number }) =>
      initializeSkullKingMatch(matchId, { playerCount }),
  });
}

export function usePlaceBid() {
  return useMutation({
    mutationFn: ({ matchId, roundNumber, playerId, bid }: {
      matchId: string;
      roundNumber: number;
      playerId: string;
      bid: number;
    }) => placeBid(matchId, roundNumber, { playerId, bid }),
  });
}

export function useSubmitResult() {
  return useMutation({
    mutationFn: ({ matchId, roundNumber, ...body }: {
      matchId: string;
      roundNumber: number;
    } & SubmitResultRequest) => submitRoundResult(matchId, roundNumber, body),
  });
}

export function useFinalizeRound() {
  return useMutation({
    mutationFn: ({ matchId, roundNumber }: { matchId: string; roundNumber: number }) =>
      finalizeRound(matchId, roundNumber),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: skullKingKeys.scoreboard(variables.matchId),
      });
    },
  });
}
