const PLAYER_COLORS = [
  { bg: 'bg-player-1', text: 'text-purple-900', label: 'Lavender' },
  { bg: 'bg-player-2', text: 'text-green-900', label: 'Mint' },
  { bg: 'bg-player-3', text: 'text-orange-900', label: 'Peach' },
  { bg: 'bg-player-4', text: 'text-blue-900', label: 'Blue' },
  { bg: 'bg-player-5', text: 'text-rose-900', label: 'Rose' },
  { bg: 'bg-player-6', text: 'text-yellow-900', label: 'Yellow' },
] as const;

export function getPlayerColor(seatIndex: number) {
  return PLAYER_COLORS[seatIndex % PLAYER_COLORS.length];
}

export function getPlayerInitial(displayName: string) {
  return displayName.charAt(0).toUpperCase();
}
