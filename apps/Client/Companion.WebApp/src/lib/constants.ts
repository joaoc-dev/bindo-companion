export const TOTAL_ROUNDS = 10;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export const GAME_SLUGS = {
  SKULL_KING: 'skull-king',
} as const;

export const ROUND_STATUS = {
  OPEN: 'Open',
  FINALIZED: 'Finalized',
} as const;

export const MATCH_PHASE = {
  BIDDING: 'bidding',
  PLAYING: 'playing',
  SCORING: 'scoring',
  REVIEW: 'review',
  GAME_OVER: 'game-over',
} as const;

export type MatchPhase = (typeof MATCH_PHASE)[keyof typeof MATCH_PHASE];
