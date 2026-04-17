# REDLINE FC - Governance MVP Execution

## 0. Scope Freeze (MVP)
- Platform: PC only.
- Modes: local multiplayer only, 2-4 players.
- Play offering: Quick Match only.
- Content: one arena.
- Ruleset: one ruleset.

## Explicit Non-Goals
- No online multiplayer.
- No progression systems.
- No offside in MVP.
- No replay system.
- No ranked ladder, tournament mode, cosmetics, or account meta.

## MVP Pillar Acceptance Criteria

### Passing feel
- Core pass types are consistently usable and readable in match flow.
- Targeting outcomes are understandable to players without debug tools.
- Pass/receive loop supports repeatable possession play, not random turnover spam.

### Tackle fairness
- Tackles produce consistent outcomes from similar inputs and angles.
- Illegal contact and foul outcomes are predictable from context.
- Anti-spam windows prevent dominant tackle loops.

### Camera readability
- Ball, carrier, and nearest contest lane stay visible in active play.
- Rapid transitions (turnovers, goals, restarts) remain understandable.
- Shared-screen readability remains intact in local multiplayer sessions.

### Low downtime
- Restart and transition flow resumes control quickly after dead-ball events.
- Goal and half transitions preserve pace targets for quick rematch sessions.
- Match loop avoids long non-interactive segments.

### Local clarity
- 2-4 local players can identify team, control, and play state at a glance.
- Core callouts (goal/foul/restart) are legible and timely.
- Onboarding to active play remains within one minute.

## Definition of Done (Gameplay Features)
- Code implementation completed and integrated in runtime flow.
- Automated/manual tests updated and passing for affected feature scope.
- Tuning pass completed against gameplay targets.
- UX/readability pass completed for local play clarity.
- Performance pass completed (frame pacing and allocation sanity).

## Milestone Cadence and Review Ritual
- Weekly gameplay validation session with recorded findings and decisions.
- Weekly risk review with explicit mitigation owners.
- Weekly scope control checkpoint: no MVP expansion without explicit approval.
- Step-based execution tracking aligned to checklist section 20.
