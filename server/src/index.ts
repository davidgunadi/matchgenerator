import cors from "cors";
import express from "express";
import { generatePadelSchedule } from "./generator.js";

interface GenerateRequest {
  teams?: string[];
  courts?: number;
}

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/generate-matches", (req, res) => {
  const { teams, courts } = req.body as GenerateRequest;

  if (!Array.isArray(teams) || typeof courts !== "number") {
    return res.status(400).json({ error: "Payload must contain teams[] and courts." });
  }

  const sanitizedTeams = teams.map((team) => team.trim()).filter(Boolean);

  try {
    const rounds = generatePadelSchedule(sanitizedTeams, courts);

    return res.json({
      teams: sanitizedTeams.length,
      courts,
      totalMatches: (sanitizedTeams.length * (sanitizedTeams.length - 1)) / 2,
      rounds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scheduling error";
    return res.status(400).json({ error: message });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Padel match generator API running on port ${port}`);
});
