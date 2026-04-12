import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BonusPickerProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  points: number;
}

export function BonusPicker({ label, value, onChange, min = 0, max, points }: BonusPickerProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <span className="text-sm">{label}</span>
        <span className="ml-1.5 text-xs text-muted-foreground">
          (
          {points}
          pts each)
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="size-3" />
        </Button>
        <span className="w-6 text-center text-sm font-semibold font-score">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus className="size-3" />
        </Button>
      </div>
    </div>
  );
}
