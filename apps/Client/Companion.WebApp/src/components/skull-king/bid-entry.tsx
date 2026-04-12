import type { LocalPlayer } from '@/hooks/use-players';
import { Check, Loader2, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPlayerColor, getPlayerInitial } from '@/lib/player-colors';

interface BidEntryProps {
  player: LocalPlayer;
  seatIndex: number;
  roundNumber: number;
  onBidConfirmed: (playerId: string, bid: number) => void;
  isPending: boolean;
  isConfirmed: boolean;
  confirmedBid?: number;
}

export function BidEntry({
  player,
  seatIndex,
  roundNumber,
  onBidConfirmed,
  isPending,
  isConfirmed,
  confirmedBid,
}: BidEntryProps) {
  const [bid, setBid] = useState(0);
  const color = getPlayerColor(seatIndex);

  if (isConfirmed) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-3 py-2">
        <Avatar className="size-8">
          <AvatarFallback className={`${color.bg} ${color.text} text-xs font-semibold`}>
            {getPlayerInitial(player.displayName)}
          </AvatarFallback>
        </Avatar>
        <span className="flex-1 text-sm font-medium">{player.displayName}</span>
        <Badge variant="secondary" className="gap-1">
          <Check className="size-3" />
          Bid:
          {' '}
          <span className="font-score">{confirmedBid}</span>
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
      <Avatar className="size-8">
        <AvatarFallback className={`${color.bg} ${color.text} text-xs font-semibold`}>
          {getPlayerInitial(player.displayName)}
        </AvatarFallback>
      </Avatar>
      <span className="flex-1 text-sm font-medium">{player.displayName}</span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => setBid(prev => Math.max(0, prev - 1))}
          disabled={bid <= 0}
          aria-label="Decrease bid"
        >
          <Minus className="size-3" />
        </Button>
        <span className="w-8 text-center text-sm font-bold font-score">{bid}</span>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => setBid(prev => Math.min(roundNumber, prev + 1))}
          disabled={bid >= roundNumber}
          aria-label="Increase bid"
        >
          <Plus className="size-3" />
        </Button>
      </div>
      <Button
        size="sm"
        onClick={() => onBidConfirmed(player.id, bid)}
        disabled={isPending}
        className="gap-1"
      >
        {isPending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
        Bid
      </Button>
    </div>
  );
}
