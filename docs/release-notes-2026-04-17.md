# Release Notes — REDLINE FC Web Prototype

Date: 2026-04-17
Version: 0.1.0-dev (local milestone)

## Highlights
- Solo mode now supports full team control with player switching (`Tab`).
- Auto-control follow improves solo play when your team regains possession.
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
- Tests expanded and passing (16 total).
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
