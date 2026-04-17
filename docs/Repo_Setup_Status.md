# REDLINE FC - Repo Setup Status (Current)

Last updated: 2026-04-17

## Current state
This repository is an active web prototype built with TypeScript, Vite, and Three.js.
It is no longer a Unity runtime repo.

Implemented and present in the current codebase:
- Vite-based local dev/build pipeline
- TypeScript gameplay modules under `src/game/`
- Browser entry flow via `index.html` + `src/main.ts`
- Match state machine with kickoff, scoring, halftime, full-time, and pause/resume handling
- Local 1P / 2P keyboard mode selection
- HUD overlay for score, timer, possession, stamina, and match callouts
- Minimal automated test coverage for core match transitions via Vitest
- Static asset pipeline via `public/`

## Validation status
Validated locally on this machine:
- `npm install`: passing
- `npm run lint`: passing
- `npm run test`: passing
- `npm run build`: passing

Not yet validated in this pass:
- `npm run preview`
- cross-browser smoke tests
- mobile viewport validation
- runtime performance profiling

## Documentation status
Current source-of-truth docs:
- `README.md`
- `BUILD.md`
- `docs/Technical_Architecture.md`
- `docs/Complete_Game_Development_Checklist.md`
- `docs/web-release-checklist.md`
- `KNOWN_ISSUES.md`

Some older docs still contain Unity-era planning language. Those should be treated as historical reference unless they have been rewritten for the web stack.

## Next recommended focus
1. Expand automated tests beyond `Match` state transitions.
2. Replace or further modularize remaining large gameplay surfaces (especially `game.html` if still used as fallback/reference).
3. Complete browser smoke checks and preview validation.
4. Continue polishing restart/set-piece flows and character/team wiring.
