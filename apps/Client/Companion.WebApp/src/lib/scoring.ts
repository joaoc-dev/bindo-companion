export interface BonusInput {
  mermaidsCaptured: number;
  skullKingCaptured: number;
  piratesCapturedByMermaid: number;
  standardBonuses: number;
}

function bonusTotal(bonuses: BonusInput): number {
  return (
    bonuses.mermaidsCaptured * 20
    + bonuses.skullKingCaptured * 30
    + bonuses.piratesCapturedByMermaid * 50
    + bonuses.standardBonuses * 10
  );
}

export function previewScore(
  bid: number,
  tricksWon: number,
  bonuses: BonusInput,
  roundNumber: number,
): number {
  if (bid === 0) {
    return tricksWon === 0
      ? roundNumber * 10
      : roundNumber * -10;
  }

  if (tricksWon === bid) {
    return bid * 20 + bonusTotal(bonuses);
  }

  return Math.abs(tricksWon - bid) * -10;
}
