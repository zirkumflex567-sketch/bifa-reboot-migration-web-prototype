# REDLINE FC - Complete Web Development Checklist

Status scale:
- [ ] Not started
- [~] In progress
- [x] Done

This checklist reflects the current web prototype direction.
Unity-specific setup items were intentionally removed from the active checklist.

## 0. Product direction and scope
- [x] Browser-first prototype direction locked.
- [x] Core stack chosen: TypeScript + Vite + Three.js.
- [x] Local prototype scope documented.
- [~] MVP acceptance criteria aligned with the actual web gameplay loop.
- [ ] Release owner/date process standardized.

## 1. Repository and tooling foundations
- [x] `package.json` scripts for dev/test/lint/build exist.
- [x] Static asset pipeline available through `public/`.
- [x] Basic web build pipeline works locally.
- [x] ESLint configured and passing.
- [x] Vitest configured and passing.
- [x] Preview/startup flow documented and manually re-checked.

## 2. Runtime entry and UX shell
- [x] Browser shell (`index.html`) exists.
- [x] Game bootstrap (`src/main.ts`) exists.
- [x] Title/start overlay exists.
- [x] 1P/2P local mode selection exists.
- [~] Captain/roster selection started.
- [~] Pause menu / full overlay flow implemented (resume/restart/setup), visual polish ongoing.
- [ ] Options/settings shell exists.

## 3. Core gameplay architecture
- [x] Main game orchestrator exists.
- [x] Match state machine exists.
- [x] Ball runtime module exists.
- [x] Player runtime module exists.
- [x] AI module exists.
- [x] Combat module exists.
- [x] HUD module exists.
- [~] Remaining monolith/legacy surfaces identified and being reduced.

## 4. Match flow
- [x] Waiting-to-start flow exists.
- [x] Kickoff setup flow exists.
- [x] Goal scoring updates scoreboard.
- [x] Goal restart returns play to kickoff.
- [x] Halftime transition exists.
- [x] Full-time transition exists.
- [x] Pause/resume flow exists.
- [ ] Set-piece restrictions fully enforced.
- [~] Penalty flow implemented (prototype auto-penalty routing in place, full dedicated sequence pending).
- [x] Draw handling beyond regular time implemented (overtime + sudden death).

## 5. Player controls and local multiplayer
- [x] P1 keyboard controls wired.
- [x] Local 2P mode available.
- [x] Sprint implemented.
- [x] Dash implemented.
- [x] Pass implemented.
- [x] Shoot implemented.
- [x] Tackle implemented.
- [~] Controls onboarding expanded (quick-controls panel + key map + mode hints); polish still ongoing.
- [ ] Gamepad support validated.

## 6. Gameplay feel and balancing
- [~] Movement feel baseline exists.
- [~] Passing baseline exists.
- [~] Shooting baseline exists.
- [x] Tackle/foul baseline exists (angle/late/reckless classifier depth improved).
- [~] Character/team selection partially affects gameplay assignment.
- [ ] Restart/set-piece behavior polished.
- [ ] Balance pass captured in tuning docs.

## 7. UI / HUD / feedback
- [x] Score display exists.
- [x] Timer display exists.
- [x] Possession indicator exists.
- [x] Stamina UI exists.
- [x] Match callouts exist.
- [ ] Production HUD layout finalized.
- [ ] Pause/full-time UX consistency improved.
- [ ] Readability checked at desktop and tablet sizes.

## 8. Tests and technical quality
- [x] Match unit tests exist.
- [x] Build passes locally.
- [x] Lint passes locally.
- [x] Automated test coverage started.
- [x] Additional gameplay unit tests added.
- [~] Smoke/integration coverage added (preview HTTP smoke check automated; gameplay integration tests still pending).
- [x] Match-state tests expanded for overtime/sudden death/penalty routing.
- [x] Bundle size tracking recorded over time.

## 9. Release readiness
- [x] `npm run preview` smoke-tested.
- [~] Desktop browser matrix defined (`docs/viewport-validation-matrix.md`), manual execution pending.
- [~] Mobile viewport matrix defined (`docs/viewport-validation-matrix.md`), manual execution pending.
- [~] Known issues triaged before release (prioritized in `KNOWN_ISSUES.md`, closure pending).
- [x] Performance baseline captured.
- [x] Release notes updated.
