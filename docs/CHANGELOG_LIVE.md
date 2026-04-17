# Live Changelog

This is the running changelog for active development.

## 2026-04-18
- Repository was cleaned back to football-only scope.
- Mixed car-battle/roguelike artifacts were removed from `master`.
- Validation gates passed after cleanup:
  - `npm run test`
  - `npm run lint`
  - `npm run build`
- Added AI demo mode for observable playtests (`AI DEMO` setup button, URL `?aivsa=1`).
- Increased pitch dimensions to better fit high-action gameplay.
- Tuned camera bounds and AI spacing/ranges for larger field scale.
- Added automatic match cycling in autoplay/AI-demo mode (full-time -> next kickoff after short delay).

## 2026-04-17
- Added/validated match-state improvements around overtime/sudden death and flow stability.
- Added QA/audit documentation for release-readiness tracking.
