# REDLINE FC Web — Build & Run Guide

## Prerequisites
- Node.js 18+ 
- npm 9+

## Setup
```bash
cd bifa-reboot-migration-web-prototype
npm install
```

## Development
```bash
npm run dev
# Opens at http://localhost:5173/
```

Vite provides Hot Module Replacement — save any file and the browser auto-reloads.

## Production Build
```bash
npm run test
npm run build
# Output: dist/
```

Serve locally:
```bash
npm run preview
# Verified locally: HTTP 200 on http://127.0.0.1:4173
```

## Project Structure
```
├── game.html              ← Main game (standalone, all-in-one)
├── prototype.html         ← Earlier prototype (read-only reference)
├── index.html             ← Landing page
├── src/
│   ├── config/
│   │   ├── tuning.ts      ← CFG gameplay constants
│   │   └── archetypes.ts  ← 12 characters, tricks, chaos mods
│   ├── audio/
│   │   └── SFX.ts         ← Procedural Web Audio SFX
│   ├── input/
│   │   └── Input.ts       ← Keyboard + Gamepad system
│   ├── match/
│   │   └── MatchState.ts  ← Match phases, ball/player state enums
│   └── index.ts           ← Barrel export
├── public/                ← Static assets (models, textures)
├── KNOWN_ISSUES.md        ← Open bugs & limitations
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## TypeScript Check
```bash
npx tsc --noEmit
# Should exit with code 0
```

## Controls
| P1 Key | Action |
|--------|--------|
| WASD | Move |
| Shift | Sprint |
| Space | Pass |
| E | Shoot |
| Q | Tackle |
| Ctrl | Turbo Dash |
| Tab | Solo: control to next teammate |
| Esc | Pause |

Note:
- In 1P mode you now control the whole blue team by switching with `Tab`.
- Control also auto-follows your current ball carrier when your team takes possession.

## Deployment
Static build (`dist/`) can be deployed to any static host:
- Vercel: `vercel --prod`
- Netlify: drag & drop `dist/`
- GitHub Pages: push `dist/` to `gh-pages` branch
