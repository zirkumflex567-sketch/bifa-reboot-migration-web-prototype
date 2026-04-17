# Decisions Log

## 2026-04-18 - Keep Football Scope Strict
- Decision: `master` remains football-only; no car-battler/roguelike systems in this repo.
- Reason: mixed scope caused instability and confusion across machines.
- Impact:
  - Features from other game types must live in separate repos/branches.
  - Scope checks are required before merge/push.

## 2026-04-18 - Enforce Continuous Documentation
- Decision: every non-trivial code change must update live docs in same session.
- Reason: reduce drift and keep project state reviewable at any time.
- Impact:
  - `docs/SESSION_LOG.md`, `docs/CHANGELOG_LIVE.md`, and status docs are now part of delivery.
