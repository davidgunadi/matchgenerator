import { FormEvent, useMemo, useState } from "react";

interface CourtMatch {
  teamA: string;
  teamB: string;
  court: number;
}

interface MatchRound {
  round: number;
  matches: CourtMatch[];
}

interface ScheduleResponse {
  teams: number;
  courts: number;
  totalMatches: number;
  rounds: MatchRound[];
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export default function App() {
  const [teamCount, setTeamCount] = useState(4);
  const [courts, setCourts] = useState(1);
  const [teamNames, setTeamNames] = useState<string[]>(["Team 1", "Team 2", "Team 3", "Team 4"]);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleTeamNames = useMemo(() => {
    const next = [...teamNames];
    if (next.length < teamCount) {
      for (let i = next.length; i < teamCount; i += 1) {
        next.push(`Team ${i + 1}`);
      }
    }

    return next.slice(0, teamCount);
  }, [teamCount, teamNames]);

  const updateTeamCount = (nextCount: number) => {
    setTeamCount(nextCount);
    setTeamNames((current) => {
      const next = [...current];
      if (next.length < nextCount) {
        for (let i = next.length; i < nextCount; i += 1) {
          next.push(`Team ${i + 1}`);
        }
      }
      return next.slice(0, nextCount);
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSchedule(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/generate-matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teams: visibleTeamNames, courts }),
      });

      const payload = (await response.json()) as ScheduleResponse | { error: string };

      if (!response.ok || "error" in payload) {
        setError(payload.error ?? "Unable to generate matches");
        return;
      }

      setSchedule(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="layout">
      <section className="panel">
        <h1>Padel Match Generator</h1>
        <p>Create balanced team-vs-team rounds using your available courts.</p>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Number of teams
            <input
              type="number"
              min={2}
              value={teamCount}
              onChange={(event) => updateTeamCount(Number(event.target.value))}
              required
            />
          </label>

          <label>
            Available courts
            <input
              type="number"
              min={1}
              value={courts}
              onChange={(event) => setCourts(Number(event.target.value))}
              required
            />
          </label>

          <div className="team-list">
            <h2>Team names</h2>
            {visibleTeamNames.map((teamName, index) => (
              <label key={`team-${index}`}>
                Team {index + 1}
                <input
                  type="text"
                  value={teamName}
                  onChange={(event) => {
                    const value = event.target.value;
                    setTeamNames((current) => {
                      const next = [...current];
                      next[index] = value;
                      return next;
                    });
                  }}
                  required
                />
              </label>
            ))}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Generating..." : "Generate matches"}
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="panel">
        <h2>Schedule</h2>

        {!schedule ? (
          <p>Fill the form and click <strong>Generate matches</strong> to see rounds.</p>
        ) : (
          <>
            <p>
              Generated <strong>{schedule.totalMatches}</strong> matches across <strong>{schedule.rounds.length}</strong>{" "}
              rounds.
            </p>
            <div className="rounds">
              {schedule.rounds.map((round) => (
                <article key={round.round} className="round-card">
                  <h3>Round {round.round}</h3>
                  <ul>
                    {round.matches.map((match) => (
                      <li key={`${round.round}-${match.court}`}>
                        Court {match.court}: {match.teamA} vs {match.teamB}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
