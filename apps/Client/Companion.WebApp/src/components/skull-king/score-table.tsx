import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TOTAL_ROUNDS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ScoreRow {
  playerId: string;
  displayName: string;
  rounds: (number | null)[];
  total: number;
}

interface ScoreTableProps {
  players: { playerId: string; displayName: string }[];
  rounds: { roundNumber: number; entries: { playerId: string; score: number | null }[] }[];
  totals: { playerId: string; total: number }[];
}

const columnHelper = createColumnHelper<ScoreRow>();

function scoreCell(value: number | null) {
  if (value == null)
    return <span className="text-muted-foreground">-</span>;
  return (
    <span className={cn(
      'font-score font-semibold',
      value > 0 && 'text-score-positive',
      value < 0 && 'text-score-negative',
      value === 0 && 'text-score-zero',
    )}
    >
      {value > 0 ? '+' : ''}
      {value}
    </span>
  );
}

export function ScoreTable({ players, rounds, totals }: ScoreTableProps) {
  const data: ScoreRow[] = players.map((p) => {
    const roundScores = Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
      const round = rounds.find(r => (r.roundNumber as number) === i + 1);
      const entry = round?.entries.find(e => e.playerId === p.playerId);
      return entry?.score ?? null;
    });
    const playerTotal = totals.find(t => t.playerId === p.playerId);

    return {
      playerId: p.playerId,
      displayName: p.displayName,
      rounds: roundScores,
      total: (playerTotal?.total as number) ?? 0,
    };
  });

  const columns = [
    columnHelper.accessor('displayName', {
      header: 'Player',
      cell: info => <span className="text-sm font-medium">{info.getValue()}</span>,
    }),
    ...Array.from({ length: TOTAL_ROUNDS }, (_, i) =>
      columnHelper.accessor(row => row.rounds[i], {
        id: `r${i + 1}`,
        header: `R${i + 1}`,
        cell: info => scoreCell(info.getValue()),
      })),
    columnHelper.accessor('total', {
      header: 'Total',
      cell: info => (
        <span className="font-score text-sm font-bold">{info.getValue()}</span>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <ScrollArea className="w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'text-center text-xs',
                    header.id === 'displayName' && 'sticky left-0 z-10 bg-background text-left',
                    header.id === 'total' && 'text-right',
                  )}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    'text-center',
                    cell.column.id === 'displayName' && 'sticky left-0 z-10 bg-background text-left',
                    cell.column.id === 'total' && 'text-right',
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
