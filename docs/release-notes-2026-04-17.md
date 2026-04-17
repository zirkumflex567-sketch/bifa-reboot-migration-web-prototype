# Release Notes — REDLINE FC Web Prototype

Date: 2026-04-17
Version: 0.1.0-dev (local milestone)

## Highlights
- Solo mode now supports full team control with player switching (`Tab`).
- Auto-control follow improves solo play when your team regains possession.
- Added controlled set-piece restart flow for throw-ins, corner-kicks, and goal-kicks (non-kicker control lock + designated restart taker).
- Added tactical set-piece repositioning templates so both teams are moved into restart-specific shapes.
- Added baseline defender spacing rules for set-pieces (minimum distance to restart spot + anti-overlap spread).
- Added simple man-marking assignment so defenders map to nearby attacking restart threats.
- Added adaptive set-piece marking updates so defending players slide toward evolving ball lanes during restart setups.
- Added short-restart variants (short throw-ins / short corners) so attacking support can shift closer to the taker in selected situations.
- Added restart-specific defensive behavior modes (hold/contain/press) for more tactical reaction during set-pieces.
- Added near/far-post corner pattern variants for more diverse corner support runs.
- Added hybrid zonal-man defensive assignment to blend central lane protection with marker-follow behavior at set-pieces.
- Added role-weighted set-piece defender profiles (blocker/cover/interceptor) for contextual assignment tuning.
- Added dedicated player-controlled penalty sequence (replacing forced auto-goal penalties) with explicit goal/saved outcomes.
- Added basic keeper-save rebound continuation so missed penalties stay live instead of hard-resetting to kickoff.
- Added penalty shot aim/power influence (player input affects conversion odds) with keeper-skill aware resolution.
- Added keeper read/anticipation penalty model to improve shot-side prediction outcomes.
- Added timed keeper commitment-window model to further shape save probability by shot profile.
- Added parry-lane rebound shaping so saved penalties deflect into shot-dependent lanes.
- Added keeper feint-response penalty modeling to reflect commitment risk against late shot direction changes.
- Added keeper recovery-delay model to tune post-save second-action timing and rebound pace.
- Added clear active-player visual indicators.
- Added pause overlay menu with keyboard navigation:
  - Resume Match
  - Restart Match
  - Back to Setup
- Added pause-menu click handling so Resume/Restart/Back-to-Setup actions work via mouse as well as keyboard.
- Fixed static-build subpath loading for `/bifa/` deployment (`base: './'`) and aligned nginx route handling for hashed assets.

## UX and UI
- Expanded setup-screen onboarding with quick controls block.
- Added explicit warning in setup screen for always-on vuvuzela mode.
- Controls hints updated for `Tab` player switch.

## Quality and verification
- Lint passing.
- Tests expanded and passing (50 total).
- Build passing.
- Preview smoke check passing (HTTP 200).

## Docs and tracking
- Checklist updated with latest implementation status.
- Known issues triaged with P0/P1/P2 priorities.
- Bundle size history file added.
- Initial performance baseline file added.
- Viewport validation matrix file added (manual browser pass still pending).

## Remaining known gaps (short)
- Set-piece restrictions and penalty flow.
- Gamepad validation.
- Final HUD polish and pause/full-time UX consistency polish.
- Desktop/mobile browser matrix execution.
