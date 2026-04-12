import type { MatchPhase } from '@/lib/constants';
import { cn } from '@/lib/utils';

const phaseConfig: Record<MatchPhase, { label: string; description: string; className: string }> = {
  'bidding': {
    label: 'Bidding',
    description: 'Each player places their bid',
    className: 'bg-phase-bidding text-blue-800',
  },
  'playing': {
    label: 'Playing',
    description: 'Play the round with your cards',
    className: 'bg-phase-playing text-green-800',
  },
  'scoring': {
    label: 'Scoring',
    description: 'Enter each player\'s results',
    className: 'bg-phase-scoring text-purple-800',
  },
  'review': {
    label: 'Round Review',
    description: 'Review scores and finalize',
    className: 'bg-phase-review text-orange-800',
  },
  'game-over': {
    label: 'Game Over',
    description: 'View the final scoreboard',
    className: 'bg-phase-scoring text-purple-800',
  },
};

interface GamePhaseBannerProps {
  phase: MatchPhase;
  roundNumber: number;
}

export function GamePhaseBanner({ phase, roundNumber }: GamePhaseBannerProps) {
  const config = phaseConfig[phase];

  return (
    <div className={cn('rounded-lg px-4 py-3', config.className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{config.label}</p>
          <p className="text-xs opacity-80">{config.description}</p>
        </div>
        <span className="text-sm font-bold">
          Round
          {roundNumber}
        </span>
      </div>
    </div>
  );
}
