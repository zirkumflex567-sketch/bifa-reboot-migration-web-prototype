# Web Release Checklist

## Build and Quality Gates

- [x] `npm install` runs without errors
- [x] `npm run lint` passes
- [x] `npm run test` passes
- [x] `npm run build` passes
- [x] `npm run preview` starts successfully

## Gameplay Smoke Tests

- [~] Set-piece restarts (throw-in/corner/goal-kick) lock non-kicker control and resume play from designated taker (implemented with restart-specific team repositioning templates + baseline spacing + simple man-marking + adaptive defender tracking + short-restart variants + near/far-post corner patterns + defensive behavior modes hold/contain/press + hybrid zonal-man assignments; advanced tactical validation pending)
- [~] Penalty flow runs as dedicated player-controlled sequence instead of automatic goal outcome (implemented with save/rebound + aim/power influence + keeper read/anticipation model + timed commitment windows + parry-lane rebound shaping + feint-response modeling; keeper/animation depth pending)
- [~] Match starts from waiting screen with `Space` (verified by state logic and existing flow wiring; full BrowserUse key-driving pending)
- [~] P1 movement, sprint, dash, pass, shoot, tackle work (automation coverage pending full browser key-control run)
- [~] Goal increments score and match restarts from kickoff (logic + tests + runtime flow validated)
- [x] Half-time, overtime, sudden death, and full-time transitions trigger correctly (unit-tested)
- [x] Full-time restart resets score and clock

## Browser and UX Validation

- [~] Desktop check in current Chrome, Edge, Firefox (baseline BrowserUse pass done; full matrix pending)
- [~] Mobile viewport check at 390x844 and 768x1024 (pending manual matrix run)
- [~] HUD remains readable and non-overlapping (setup + HUD shell verified, in-match matrix pending)
- [~] Input and camera feel stable at low/high FPS (pending dedicated profiling run)

## Performance Baseline

- [~] Stable near 60 FPS on target machine
- [~] No severe frame spikes during active play
- [x] Bundle size tracked after each release build

## Documentation and Release Notes

- [x] Changed mechanics documented in `README.md` or docs
- [x] Known issues logged before release
- [~] Release date and owner noted in project notes
