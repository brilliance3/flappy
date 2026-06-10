# Tap Tap Tap

A **3-mode tap-action runner** built with **React 18 + Vite + TypeScript + Tailwind CSS + HTML Canvas API**. Pick a mode, pick a flyer, and thread your way through the obstacles. One code base, three distinct feels.

The game is sized for a 390×640 mobile viewport and works on touch, mouse, and keyboard (Space / ↑ / ↓).

## Game Modes

| Mode | Feel | Physics | Obstacles |
| ---- | ---- | ------- | --------- |
| ☁️ **하늘 날기 (Sky)** | Classic flappy | Gravity pulls **down**; tap flies **up** | Cloud pillars |
| 🪐 **우주 하강 (Space)** | Inverted | Drifts **up**; tap dives **down** | Asteroids / energy gates |
| 🌊 **바다 해류 모험 (Ocean)** | Strategic | Currents flip **up / down / neutral** every 4–7 s with a 1 s warning; buoyancy + tap correct your position | Coral / rock reefs |

Ocean ships with a single-tap control (MVP) and an optional **split-touch** scheme (tap the top half to rise, bottom half to sink).

## Features

- Three game styles selectable from the start screen, each with its own background, obstacles, difficulty curve and physics
- Per-mode best scores, plus selected mode / character persisted in `localStorage`
- **Synthesized audio** (Web Audio API) — no asset files: per-mode BGM and tap / score / hit / game-over / button SFX, unlocked on first tap to respect autoplay policies
- **Vibration** feedback with per-event patterns; silently ignored where unsupported
- Sound, BGM and vibration ON/OFF toggles (start screen + pause screen), all persisted
- Pause / resume with in-game settings
- Per-mode Bronze / Silver / Gold medals on the game-over screen
- Ad placeholders limited to non-gameplay screens (start / game-over)
- `useRef`-driven game loop — no React re-renders per frame

## Project Structure

```
src/
├── components/
│   ├── GameCanvas.tsx        # Generic loop; delegates to the active mode strategy
│   ├── StartScreen.tsx       # Mode + character select, settings, start
│   ├── ModeSelector.tsx      # Three mode cards with per-mode best scores
│   ├── GameOverScreen.tsx
│   ├── PausedScreen.tsx
│   ├── CharacterSelector.tsx
│   ├── SoundToggle.tsx / VibrationToggle.tsx / ToggleChip.tsx
│   └── AdSlot.tsx            # Placeholder (non-gameplay screens only)
├── modes/
│   ├── shared.ts             # ModeStrategy interface + shared draw helpers
│   ├── skyMode.ts / spaceMode.ts / oceanMode.ts
│   └── index.ts              # Mode registry + ocean-current controller
├── audio/
│   ├── audioManager.ts       # Web Audio synth engine (singleton)
│   └── audioTypes.ts
├── types/
│   └── game.ts               # Types, GAME_CONFIG, PHYSICS, GAME_MODES, MEDAL_RULES
├── utils/
│   ├── collision.ts          # AABB + bounds checks
│   ├── storage.ts            # Per-mode best scores + settings (safe localStorage)
│   ├── vibration.ts          # Patterns + feature-detected navigator.vibrate
│   └── random.ts
├── App.tsx                   # Status machine: ready → playing → paused → gameover
├── main.tsx
└── index.css
```

## localStorage keys

`twr.bestScore.{sky|space|ocean}`, `twr.selectedMode`, `twr.selectedCharacter`,
`twr.soundEnabled`, `twr.bgmEnabled`, `twr.vibrationEnabled`, `twr.oceanControl`.
The legacy `twr.bestScore` is migrated into the Sky best score on first read.

## Local Development

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Build

```bash
npm run build
```

The production bundle is emitted to `dist/`. Preview it locally with:

```bash
npm run preview
```

## Deploying to Vercel

This project ships with a `vercel.json` so the framework, build command, output directory, and caching headers are all pre-configured. You don't have to touch anything in the Vercel dashboard.

### Option A — Dashboard import

1. Push the repo to GitHub / GitLab / Bitbucket.
2. In the Vercel dashboard, click **Add New… → Project** and import the repo.
3. Vercel reads `vercel.json` and auto-detects Vite. Just click **Deploy** — no settings to change, no env vars needed.

### Option B — CLI

```bash
npm i -g vercel
cd "/path/to/Flappy Bird"
vercel        # follow the prompts for first-time setup
vercel --prod # production deploy
```

### Routes after deploy

- `/`         — React + Vite version (the full game)
- `/play`     — Standalone single-file version (also reachable at `/play.html`)

The `vercel.json` adds a long-lived `Cache-Control` header on `/assets/*` (Vite emits content-hashed filenames, so this is safe) and a clean URL rewrite from `/play` → `/play.html`.

### Notes

- `npm run build` runs `tsc -b` first, so any TypeScript error fails the Vercel build instead of slipping into production.
- Node 18+ is required (declared in `package.json` engines). Vercel uses Node 22 by default — that works.
- No environment variables are needed for the MVP.

## Controls

| Mode | Tap / Click / `Space` / `↑` / `↓` |
| ---- | --------------------------------- |
| Sky | Fly up |
| Space | Dive down |
| Ocean | Rise (single-tap) — or top-half rise / bottom-half sink (split) |

## Tuning Knobs

Shared physics constants live in `src/types/game.ts` (`PHYSICS`, `GAME_CONFIG`, `MEDAL_RULES`). Each mode's difficulty curve and feel live in its own file under `src/modes/` (`getSpeed`, `getGap`, `updatePlayer`, `handleInput`). The ocean current timing/weighting is in `oceanMode.ts` (`updateOceanCurrent`, `pickDirection`). Audio tracks/SFX are in `src/audio/audioManager.ts`; vibration patterns in `src/utils/vibration.ts`.
