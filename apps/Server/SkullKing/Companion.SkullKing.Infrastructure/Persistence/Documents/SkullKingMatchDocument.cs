using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Companion.SkullKing.Infrastructure.Persistence.Documents;

internal class SkullKingMatchDocument
{
    [BsonId]
    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    public Guid Id { get; set; }
    public int PlayerCount { get; set; }
    public int TotalRounds { get; set; }
    public List<RoundDocument> Rounds { get; set; } = [];
}

internal class RoundDocument
{
    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    public Guid Id { get; set; }
    public int RoundNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<RoundEntryDocument> Entries { get; set; } = [];
}

internal class RoundEntryDocument
{
    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    public Guid Id { get; set; }

    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    public Guid PlayerId { get; set; }
    public int Bid { get; set; }
    public int? TricksWon { get; set; }
    public int? MermaidsCaptured { get; set; }
    public int? SkullKingCaptured { get; set; }
    public int? PiratesCapturedByMermaid { get; set; }
    public int? StandardBonuses { get; set; }
    public int? Score { get; set; }
}
