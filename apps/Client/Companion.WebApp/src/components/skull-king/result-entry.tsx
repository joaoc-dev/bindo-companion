import type { LocalPlayer } from '@/hooks/use-players';
import type { BonusInput } from '@/lib/scoring';
import { Check, Loader2, Minus, Plus } from 'lucide-react';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPlayerColor, getPlayerInitial } from '@/lib/player-colors';
import { previewScore } from '@/lib/scoring';
import { cn } from '@/lib/utils';
import { BonusPicker } from './bonus-picker';

interface ResultEntryProps {
  player: LocalPlayer;
  seatIndex: number;
  roundNumber: number;
  bid: number;
  onSubmit: (playerId: string, result: { tricksWon: number } & BonusInput) => void;
  isPending: boolean;
  isSubmitted: boolean;
  submittedScore?: number;
}

export function ResultEntry({
  player,
  seatIndex,
  roundNumber,
  bid,
  onSubmit,
  isPending,
  isSubmitted,
  submittedScore,
}: ResultEntryProps) {
  const [tricksWon, setTricksWon] = useState(0);
  const [bonuses, setBonuses] = useState<BonusInput>({
    mermaidsCaptured: 0,
    skullKingCaptured: 0,
    piratesCapturedByMermaid: 0,
    standardBonuses: 0,
  });

  const color = getPlayerColor(seatIndex);
  const preview = previewScore(bid, tricksWon, bonuses, roundNumber);

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-3 py-2">
        <Avatar className="size-8">
          <AvatarFallback className={`${color.bg} ${color.text} text-xs font-semibold`}>
            {getPlayerInitial(player.displayName)}
          </AvatarFallback>
        </Avatar>
        <span className="flex-1 text-sm font-medium">{player.displayName}</span>
        <Badge
          variant="secondary"
          className={cn(
            'gap-1 font-score',
            submittedScore != null && submittedScore > 0 && 'bg-score-positive/10 text-score-positive',
            submittedScore != null && submittedScore < 0 && 'bg-score-negative/10 text-score-negative',
          )}
        >
          <Check className="size-3" />
          {submittedScore != null && submittedScore > 0 ? '+' : ''}
          {submittedScore}
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarFallback className={`${color.bg} ${color.text} text-xs font-semibold`}>
            {getPlayerInitial(player.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <span className="text-sm font-medium">{player.displayName}</span>
          <span className="ml-2 text-xs text-muted-foreground">
            Bid:
            {bid}
          </span>
        </div>
        <div className={cn(
          'font-score text-sm font-bold',
          preview > 0 && 'text-score-positive',
          preview < 0 && 'text-score-negative',
          preview === 0 && 'text-score-zero',
        )}
        >
          {preview > 0 ? '+' : ''}
          {preview}
        </div>
      </div>

      {/* Tricks Won */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">Tricks Won</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => setTricksWon(prev => Math.max(0, prev - 1))}
            disabled={tricksWon <= 0}
            aria-label="Decrease tricks"
          >
            <Minus className="size-3" />
          </Button>
          <span className="w-8 text-center text-sm font-bold font-score">{tricksWon}</span>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => setTricksWon(prev => Math.min(roundNumber, prev + 1))}
            disabled={tricksWon >= roundNumber}
            aria-label="Increase tricks"
          >
            <Plus className="size-3" />
          </Button>
        </div>
      </div>

      {/* Bonuses -- only relevant when bid was correct */}
      {tricksWon === bid && bid > 0 && (
        <div className="space-y-2 rounded-md bg-muted/50 p-2">
          <p className="text-xs font-medium text-muted-foreground">Bonuses</p>
          <BonusPicker
            label="Mermaids"
            value={bonuses.mermaidsCaptured}
            onChange={v => setBonuses(prev => ({ ...prev, mermaidsCaptured: v }))}
            max={4}
            points={20}
          />
          <BonusPicker
            label="Skull King"
            value={bonuses.skullKingCaptured}
            onChange={v => setBonuses(prev => ({ ...prev, skullKingCaptured: v }))}
            max={1}
            points={30}
          />
          <BonusPicker
            label="Pirates (by Mermaid)"
            value={bonuses.piratesCapturedByMermaid}
            onChange={v => setBonuses(prev => ({ ...prev, piratesCapturedByMermaid: v }))}
            max={5}
            points={50}
          />
          <BonusPicker
            label="Standard"
            value={bonuses.standardBonuses}
            onChange={v => setBonuses(prev => ({ ...prev, standardBonuses: v }))}
            max={10}
            points={10}
          />
        </div>
      )}

      <Button
        size="sm"
        className="w-full gap-1"
        onClick={() => onSubmit(player.id, { tricksWon, ...bonuses })}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
        Submit Result
      </Button>
    </div>
  );
}
