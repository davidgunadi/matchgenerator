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
- **Android wrapper**: Native Android WebView (`/android`)

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

## Build an APK

The frontend is now self-contained and can run without the backend when packaged in Android.

1. Install Android SDK (API 34) and JDK 17-21. Set `ANDROID_HOME` (or `ANDROID_SDK_ROOT`).
2. Build and copy web assets into the Android project:

```bash
npm run android:sync
```

3. Build debug APK (uses `android/gradlew`, so global Gradle install is optional).
   The script will auto-create `android/local.properties` from `ANDROID_HOME`/`ANDROID_SDK_ROOT` if needed:

```bash
npm run android:apk
```

APK output:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```
