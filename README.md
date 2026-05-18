# Tap Wing Runner

A Flappy-Bird–style mobile web game built with **React 18 + Vite + TypeScript + Tailwind CSS + HTML Canvas API**. Pick a flyer (chick, bat, drone, or rocket), tap to flap, and try to thread your way through the cloud pillars.

The game is sized for a 390×640 mobile viewport and works on touch, mouse, and keyboard (Space / ArrowUp).

## Features

- Original art direction — cloud pillars instead of green pipes, soft sky gradient background, parallax clouds and ground tufts
- 4 selectable characters with personalized glow color
- Gravity + jump physics tuned for "easy first 10 points, then it gets hard"
- Difficulty curve: pipe speed and gap shrink as your score climbs (capped so it stays playable)
- Bronze / Silver / Gold medal awards on the game-over screen
- Best score and last-selected character saved in `localStorage`
- Mobile-first UI, touch / pointer / keyboard input, no scrolling or accidental zoom

## Project Structure

```
src/
├── components/
│   ├── GameCanvas.tsx        # Canvas + game loop + physics + collisions
│   ├── StartScreen.tsx
│   ├── GameOverScreen.tsx
│   └── CharacterSelector.tsx
├── types/
│   └── game.ts               # Player, Obstacle, GameStatus, GameConfig
├── utils/
│   ├── collision.ts          # AABB + bounds checks
│   ├── storage.ts            # Safe localStorage helpers
│   └── random.ts
├── App.tsx                   # Status machine: ready → playing → gameover
├── main.tsx                  # React root
└── index.css                 # Tailwind layers + global resets
```

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

| Action | Input                                    |
| ------ | ---------------------------------------- |
| Flap   | Tap screen / Click / `Space` / `↑` arrow |

## Tuning Knobs

All tunable physics values live in `src/types/game.ts` (`DEFAULT_CONFIG`). The difficulty curve lives in `src/components/GameCanvas.tsx` (`getPipeSpeed` and `getPipeGap`) — tweak those to change pacing.
