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
- Added dedicated player-controlled penalty sequence (replacing forced auto-goal penalties) with explicit goal/saved outcomes.
- Added basic keeper-save rebound continuation so missed penalties stay live instead of hard-resetting to kickoff.
- Added penalty shot aim/power influence (player input affects conversion odds) with keeper-skill aware resolution.
- Added keeper read/anticipation penalty model to improve shot-side prediction outcomes.
- Added timed keeper commitment-window model to further shape save probability by shot profile.
- Added clear active-player visual indicators.
- Added pause overlay menu with keyboard navigation:
  - Resume Match
  - Restart Match
  - Back to Setup
- Added intentionally obnoxious, continuous stadium vuvuzela sound (always on).

## UX and UI
- Expanded setup-screen onboarding with quick controls block.
- Added explicit warning in setup screen for always-on vuvuzela mode.
- Controls hints updated for `Tab` player switch.

## Quality and verification
- Lint passing.
- Tests expanded and passing (42 total).
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
