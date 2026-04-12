import { z } from 'zod';
import { MAX_PLAYERS, MIN_PLAYERS, TOTAL_ROUNDS } from './constants';

export const createSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required').max(50),
});

export const addPlayerSchema = z.object({
  displayName: z.string().min(1, 'Name is required').max(30),
});

export function bidSchema(roundNumber: number) {
  return z.object({
    bid: z.number().int().min(0).max(roundNumber),
  });
}

export function resultSchema(roundNumber: number) {
  return z.object({
    tricksWon: z.number().int().min(0).max(roundNumber),
    mermaidsCaptured: z.number().int().min(0).max(4),
    skullKingCaptured: z.number().int().min(0).max(1),
    piratesCapturedByMermaid: z.number().int().min(0).max(5),
    standardBonuses: z.number().int().min(0).max(TOTAL_ROUNDS),
  });
}

export const startMatchSchema = z.object({
  gameSlug: z.string().min(1),
  playerIds: z.array(z.string().uuid()).min(MIN_PLAYERS).max(MAX_PLAYERS),
});
