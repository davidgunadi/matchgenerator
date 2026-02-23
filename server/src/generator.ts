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

const chunkMatches = (matches: TeamMatch[], size: number): TeamMatch[][] => {
  const chunks: TeamMatch[][] = [];

  for (let index = 0; index < matches.length; index += size) {
    chunks.push(matches.slice(index, index + size));
  }

  return chunks;
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
  const rounds: MatchRound[] = [];

  for (const baseRound of roundRobinRounds) {
    const splitRounds = chunkMatches(baseRound, courts);

    for (const splitRound of splitRounds) {
      rounds.push({
        round: rounds.length + 1,
        matches: splitRound.map((match, index) => ({
          ...match,
          court: index + 1,
        })),
      });
    }
  }

  return rounds;
};
