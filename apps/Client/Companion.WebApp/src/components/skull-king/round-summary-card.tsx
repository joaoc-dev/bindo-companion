import type { LocalPlayer } from '@/hooks/use-players';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getPlayerColor, getPlayerInitial } from '@/lib/player-colors';
import { cn } from '@/lib/utils';

interface RoundSummaryProps {
  roundNumber: number;
  players: LocalPlayer[];
  bids: Record<string, number>;
  results: Record<string, { tricksWon: number; score: number }>;
}

export function RoundSummaryCard({ roundNumber, players, bids, results }: RoundSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Round
          {roundNumber}
          {' '}
          Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead className="text-center">Bid</TableHead>
              <TableHead className="text-center">Tricks</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => {
              const bid = bids[player.id] ?? 0;
              const result = results[player.id];
              const color = getPlayerColor(index);
              const score = result?.score ?? 0;

              return (
                <TableRow key={player.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className={`${color.bg} ${color.text} text-[10px] font-semibold`}>
                          {getPlayerInitial(player.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{player.displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-score">{bid}</TableCell>
                  <TableCell className="text-center font-score">{result?.tricksWon ?? '-'}</TableCell>
                  <TableCell className={cn(
                    'text-right font-score font-semibold',
                    score > 0 && 'text-score-positive',
                    score < 0 && 'text-score-negative',
                    score === 0 && 'text-score-zero',
                  )}
                  >
                    {score > 0 ? '+' : ''}
                    {score}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
