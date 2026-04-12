import { Check } from 'lucide-react';
import { TOTAL_ROUNDS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface RoundStepperProps {
  currentRound: number;
  completedRounds: number;
}

export function RoundStepper({ currentRound, completedRounds }: RoundStepperProps) {
  return (
    <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={currentRound} aria-valuemin={1} aria-valuemax={TOTAL_ROUNDS}>
      {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
        const round = i + 1;
        const isCompleted = round <= completedRounds;
        const isCurrent = round === currentRound;

        return (
          <div
            key={round}
            className={cn(
              'flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-all',
              isCompleted && 'bg-score-positive text-white',
              isCurrent && !isCompleted && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
              !isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
            )}
            aria-label={`Round ${round}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
          >
            {isCompleted ? <Check className="size-3.5" /> : round}
          </div>
        );
      })}
    </div>
  );
}
