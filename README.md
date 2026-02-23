# Padel Match Generator

A simple full-stack app to create padel team-vs-team match schedules with limited court availability.

## Features
- Set number of teams.
- Set number of available courts.
- Enter custom team names dynamically from the chosen team count.
- Generate a schedule with rounds where:
  - no team appears twice in the same round,
  - all unique matchups are generated once (so repetition is minimized to zero whenever possible).

## Tech stack
- **Backend**: TypeScript + Express (`/server`)
- **Frontend**: React + TypeScript + Vite (`/client`)
- **Storage**: none (in-memory generation only)

## Run locally

```bash
npm install
npm run install:all
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Build

```bash
npm run build
```
