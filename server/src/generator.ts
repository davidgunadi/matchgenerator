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

const BYE_TEAM = "__BYE__";

const canPlaceMatchInRound = (round: TeamMatch[], match: TeamMatch, courts: number): boolean => {
  if (round.length >= courts) {
    return false;
  }

  return !round.some(
    (scheduledMatch) =>
      scheduledMatch.teamA === match.teamA ||
      scheduledMatch.teamA === match.teamB ||
      scheduledMatch.teamB === match.teamA ||
      scheduledMatch.teamB === match.teamB,
  );
};

const balanceRounds = (baseRounds: TeamMatch[][], courts: number): TeamMatch[][] => {
  const balancedRounds: TeamMatch[][] = [];

  for (const baseRound of baseRounds) {
    for (const match of baseRound) {
      let placed = false;

      for (const round of balancedRounds) {
        if (canPlaceMatchInRound(round, match, courts)) {
          round.push(match);
          placed = true;
          break;
        }
      }

      if (!placed) {
        balancedRounds.push([match]);
      }
    }
  }

  return balancedRounds;
};

const generateRoundRobinRounds = (teams: string[]): TeamMatch[][] => {
  const paddedTeams = [...teams];

  if (paddedTeams.length % 2 !== 0) {
    paddedTeams.push(BYE_TEAM);
  }

  const roundCount = paddedTeams.length - 1;
  const halfSize = paddedTeams.length / 2;
  const rotation = [...paddedTeams];
  const rounds: TeamMatch[][] = [];

  for (let round = 0; round < roundCount; round += 1) {
    const matches: TeamMatch[] = [];

    for (let index = 0; index < halfSize; index += 1) {
      const teamA = rotation[index];
      const teamB = rotation[rotation.length - 1 - index];

      if (teamA !== BYE_TEAM && teamB !== BYE_TEAM) {
        matches.push({ teamA, teamB });
      }
    }

    rounds.push(matches);

    const fixedTeam = rotation[0];
    const rotatingTeams = rotation.slice(1);
    const lastTeam = rotatingTeams.pop();

    if (!lastTeam) {
      break;
    }

    rotation.splice(0, rotation.length, fixedTeam, lastTeam, ...rotatingTeams);
  }

  return rounds;
};

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

  const roundRobinRounds = generateRoundRobinRounds(teams);
  const balancedRounds = balanceRounds(roundRobinRounds, courts);

  return balancedRounds.map((matches, roundIndex) => ({
    round: roundIndex + 1,
    matches: matches.map((match, courtIndex) => ({
      ...match,
      court: courtIndex + 1,
    })),
  }));
};
