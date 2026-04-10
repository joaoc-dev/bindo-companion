using Companion.Domain.Common;
using Companion.Domain.Players;
using Companion.Domain.Sessions;
using Companion.SkullKing.Domain.Events;
using Companion.SkullKing.Domain.Services;
using Companion.SkullKing.Domain.ValueObjects;

namespace Companion.SkullKing.Domain;

public class SkullKingMatch : AggregateRoot<MatchId>
{
    public int PlayerCount { get; private set; }
    public int TotalRounds { get; private set; }

    private readonly List<Round> _rounds = [];
    public IReadOnlyList<Round> Rounds => _rounds.AsReadOnly();

    private SkullKingMatch() { }

    public static SkullKingMatch Initialize(MatchId matchId, int playerCount)
    {
        if (playerCount is < 2 or > 6)
            throw new ArgumentOutOfRangeException(nameof(playerCount), "Skull King requires 2 to 6 players.");

        return new SkullKingMatch
        {
            Id = matchId,
            PlayerCount = playerCount,
            TotalRounds = 10
        };
    }

    public static SkullKingMatch Rehydrate(MatchId id, int playerCount, int totalRounds, IEnumerable<Round> rounds)
    {
        var match = new SkullKingMatch
        {
            Id = id,
            PlayerCount = playerCount,
            TotalRounds = totalRounds
        };
        match._rounds.AddRange(rounds);
        return match;
    }

    public Round OpenRound(int roundNumber)
    {
        if (roundNumber < 1 || roundNumber > TotalRounds)
            throw new ArgumentOutOfRangeException(nameof(roundNumber));

        if (_rounds.Any(r => r.RoundNumber == roundNumber))
            throw new InvalidOperationException($"Round {roundNumber} already exists.");

        var round = Round.Create(roundNumber);
        _rounds.Add(round);
        return round;
    }

    public void PlaceBid(int roundNumber, PlayerId playerId, Bid bid)
    {
        var round = GetRound(roundNumber);
        round.PlaceBid(playerId, bid);
    }

    public RoundScore SubmitResult(
        int roundNumber, PlayerId playerId,
        TrickCount tricksWon, BonusCollection bonuses,
        ISkullKingScoreCalculator calculator)
    {
        var round = GetRound(roundNumber);
        var entry = round.Entries.FirstOrDefault(e => e.PlayerId == playerId)
            ?? throw new InvalidOperationException($"No bid found for player {playerId.Value} in round {roundNumber}.");
        var score = calculator.Calculate(entry.Bid, tricksWon, bonuses, roundNumber);
        round.SubmitResult(playerId, tricksWon, bonuses, score);
        return score;
    }

    public void FinalizeRound(int roundNumber)
    {
        var round = GetRound(roundNumber);
        round.Close();
        Raise(new RoundFinalizedEvent(Id, roundNumber));
    }

    public void Complete()
    {
        var winner = GetLeader();
        Raise(new SkullKingMatchCompletedEvent(Id, winner));
    }

    public IReadOnlyDictionary<PlayerId, int> GetTotals()
    {
        return _rounds
            .Where(r => r.Status == RoundStatus.Finalized)
            .SelectMany(r => r.Entries)
            .GroupBy(e => e.PlayerId)
            .ToDictionary(g => g.Key, g => g.Sum(e => e.Score?.Value ?? 0));
    }

    private PlayerId GetLeader()
    {
        var totals = GetTotals();
        return totals.MaxBy(kv => kv.Value).Key;
    }

    private Round GetRound(int roundNumber) =>
        _rounds.FirstOrDefault(r => r.RoundNumber == roundNumber)
        ?? throw new InvalidOperationException($"Round {roundNumber} not found.");
}
