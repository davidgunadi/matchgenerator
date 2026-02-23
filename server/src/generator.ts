export interface TeamMatch {
  teamA: string;
  teamB: string;
}

export interface CourtMatch extends TeamMatch {
  court: number;
}

export interface MatchRound {
  round: number;
  matches: CourtMatch[];
}

const createPairKey = (a: string, b: string) => [a, b].sort().join("::");

export const generatePadelSchedule = (teams: string[], courts: number): MatchRound[] => {
  if (teams.length < 2) {
    throw new Error("At least 2 teams are required.");
  }

  if (courts < 1) {
    throw new Error("At least 1 court is required.");
  }

  const uniqueTeams = new Set(teams);
  if (uniqueTeams.size !== teams.length) {
    throw new Error("Team names must be unique.");
  }

  const pendingMatches: TeamMatch[] = [];

  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      pendingMatches.push({ teamA: teams[i], teamB: teams[j] });
    }
  }

  const rounds: MatchRound[] = [];
  const previouslyScheduled = new Map<string, number>();

  while (pendingMatches.length > 0) {
    const usedTeams = new Set<string>();
    const currentRound: TeamMatch[] = [];

    pendingMatches.sort((left, right) => {
      const leftScore =
        (previouslyScheduled.get(createPairKey(left.teamA, left.teamB)) ?? 0) +
        (usedTeams.has(left.teamA) ? 1 : 0) +
        (usedTeams.has(left.teamB) ? 1 : 0);

      const rightScore =
        (previouslyScheduled.get(createPairKey(right.teamA, right.teamB)) ?? 0) +
        (usedTeams.has(right.teamA) ? 1 : 0) +
        (usedTeams.has(right.teamB) ? 1 : 0);

      return leftScore - rightScore;
    });

    for (let i = pendingMatches.length - 1; i >= 0; i -= 1) {
      if (currentRound.length >= courts) {
        break;
      }

      const match = pendingMatches[i];
      if (!usedTeams.has(match.teamA) && !usedTeams.has(match.teamB)) {
        currentRound.push(match);
        usedTeams.add(match.teamA);
        usedTeams.add(match.teamB);
        pendingMatches.splice(i, 1);

        const matchKey = createPairKey(match.teamA, match.teamB);
        previouslyScheduled.set(matchKey, (previouslyScheduled.get(matchKey) ?? 0) + 1);
      }
    }

    if (currentRound.length === 0) {
      // fallback should never happen, but guarantees progress
      const forcedMatch = pendingMatches.shift();
      if (!forcedMatch) {
        break;
      }

      currentRound.push(forcedMatch);
      const matchKey = createPairKey(forcedMatch.teamA, forcedMatch.teamB);
      previouslyScheduled.set(matchKey, (previouslyScheduled.get(matchKey) ?? 0) + 1);
    }

    rounds.push({
      round: rounds.length + 1,
      matches: currentRound.map((match, index) => ({
        ...match,
        court: index + 1,
      })),
    });
  }

  return rounds;
};
