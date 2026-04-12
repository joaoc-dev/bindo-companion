namespace Companion.SkullKing.Domain.ValueObjects;

public record BonusCollection(
    int MermaidsCaptured,
    int SkullKingCaptured,
    int PiratesCapturedByMermaid,
    int StandardBonuses
)
{
    public static BonusCollection None => new(0, 0, 0, 0);

    public int Total =>
        MermaidsCaptured * 20
        + SkullKingCaptured * 30
        + PiratesCapturedByMermaid * 50
        + StandardBonuses * 10;
}
