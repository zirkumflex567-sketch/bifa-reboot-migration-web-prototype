# REDLINE FC - Execution Backlog (Next 4 Sprints)

Version: 1.0
Date: 2026-04-17
Planning Horizon: 4 Sprints (2 weeks each)
Goal: Deliver a production-credible competitive arcade football core with documented quality gates.

## 1. Planning Assumptions
- Team setup (recommended):
  - 2 Gameplay Engineers
  - 1 Netcode/Backend Engineer
  - 1 UI/UX Engineer
  - 1 Technical Artist/Generalist
  - 1 QA + 1 Product/Design owner
- Sprint length: 10 working days
- Definition of Done (global):
  - Feature implemented behind stable config/flag
  - Unit/integration tests added where applicable
  - Telemetry hooks included for new systems
  - Regression smoke completed (singleplayer + one online path if relevant)
  - Documentation updated

## 2. Sprint 1 - Core Gameplay Reliability & QoL Foundation
Objective: Eliminate control frustration and baseline AI-support failures.

### Epic A - Player Control & Switching (High Priority)
Story A1: Weighted auto-switch 2.0
- Implement weighted switch scoring (distance, intercept angle, stamina, role suitability, danger zone).
- Add hysteresis + min-hold + threshold guard.
Acceptance:
- Auto-switch correctness >= 90% in defined defensive test scenarios.
- No visible switch flicker in replayed stress tests.

Story A2: Manual switch UX standard
- Add switch preview marker (next candidate ghost highlight).
- Add switch lock window after manual override.
Acceptance:
- Manual override always wins for lock duration.
- User can toggle assist profile in options.

### Epic B - Teammate AI Support Layer
Story B1: Off-ball support states
- Add support lane, overlap run, safety outlet, and fallback cover behaviors.
Acceptance:
- At least 2 valid pass outlets are generated in >70% controlled attack scenarios.

Story B2: Defensive shape coherence
- Ensure nearest + cover defender split responsibilities.
Acceptance:
- Reduced "all chase ball" behavior in telemetry by 60% from baseline.

### Epic C - QoL Standards (FIFA-like expectations)
Story C1: Controls settings package
- Presets: Assisted, Semi, Manual profiles for passing/shooting/crossing through-balls.
- Defensive assists: contain/jockey variants for casual queues only.
Acceptance:
- Config applied per mode; ranked uses locked fairness profile.

Story C2: Input responsiveness package
- Input buffering windows for pass/shoot/tackle.
- Optional hold-vs-toggle sprint.
Acceptance:
- Action drop rate (input pressed no action) below target threshold.

### Sprint 1 Deliverables
- Stable switching + team AI support v1
- Assist profile system
- Updated GDD references and test matrix extension

## 3. Sprint 2 - Discipline, Set-Pieces, and Match Integrity
Objective: Deliver complete football state handling (fouls/cards/penalties/restarts).

### Epic D - Foul & Card System
Story D1: Foul severity model
- Classify contact into light/tactical/reckless/violent using angle, speed, context.
Acceptance:
- Deterministic outcomes in test fixtures for known scenarios.

Story D2: Card pipeline
- Yellow accumulation logic, direct red conditions (violent foul/DOGSO).
- Team underload behavior on red card.
Acceptance:
- Card events visible in HUD and match timeline.

### Epic E - Full Set-Piece State Machines
Story E1: Penalty sequence full implementation
- Shooter aim/timing + keeper reaction/timing + rebound handling.
Acceptance:
- End-to-end penalty flow test pass (trigger -> execute -> restart).

Story E2: Corner/throw-in/free-kick flows
- Non-kicker action lock, legal restart windows, timeout fallback.
Acceptance:
- No stuck states; all restarts resume match safely.

### Epic F - Match Flow Robustness
Story F1: Overtime/sudden-death final polish
- Integrate event banners, audio cues, and replay timeline entries.
Acceptance:
- Full match simulation passes 100-run soak tests without dead state.

### Sprint 2 Deliverables
- Fully playable match ruleset including discipline and set-pieces
- Updated QA playbook + expanded integration tests

## 4. Sprint 3 - Online Competitive Core
Objective: Stand up trustworthy online loop for alpha playtests.

### Epic G - Online Session Architecture
Story G1: Authoritative server match loop (ranked path)
- Server validates ball events, fouls, cards, goals, specials.
Acceptance:
- Client cannot force illegal state transitions.

Story G2: Prediction + reconciliation baseline
- Client predicts local movement/actions.
- Reconciliation on server snapshots with smoothing.
Acceptance:
- Perceived control latency target met in test ping buckets.

### Epic H - Matchmaking + Parties
Story H1: Queue system v1
- Ranked solo/duo queues, hidden MMR baseline.
Acceptance:
- Match found rates within acceptable waiting bounds.

Story H2: Private lobby + spectator slots
Acceptance:
- Host controls start/options, observer cannot affect simulation.

### Epic I - Fairness and Security
Story I1: Anti-cheat baseline
- Input sanity checks, suspicious pattern logging.
Acceptance:
- Major exploit vectors from threat model covered.

Story I2: Disconnect and quit policy
- Draw/no-contest/win attribution policy implemented and documented.
Acceptance:
- Match resolution policy deterministic and transparent.

### Sprint 3 Deliverables
- Playable online alpha (internal)
- Ranked core loop + anti-cheat baseline

## 5. Sprint 4 - Retention, LiveOps, and Polish
Objective: Transition from "works" to "wants to be played daily".

### Epic J - Progression and Economy
Story J1: Account level + captain mastery
- XP events tied to meaningful gameplay actions.
Acceptance:
- Progression pacing targets validated against session model.

Story J2: Cosmetic-first economy
- Store framework and reward tracks (no pay-to-win).
Acceptance:
- No gameplay stat purchase path exists in code/data model.

### Epic K - UX & Accessibility Completion
Story K1: Accessibility pass
- Remapping, colorblind palettes, UI scaling, reduced effects options.
Acceptance:
- Accessibility checklist pass with QA signoff.

Story K2: Onboarding & drills
- Contextual tutorial drills for switching, defending, specials.
Acceptance:
- New-player success funnel KPI target improved.

### Epic L - Telemetry & Live Balancing Ops
Story L1: Balancing dashboard ingestion
- Track goals/fouls/cards/special usage/win rates by MMR bucket.
Acceptance:
- Weekly tuning review package auto-generated.

Story L2: Event framework
- Time-limited modifiers and playlist scheduling.
Acceptance:
- Event can be enabled/disabled without code deploy.

### Sprint 4 Deliverables
- Soft-launch ready product loop
- LiveOps + telemetry operation ready

## 6. Dependency and Risk Matrix
Critical dependencies:
- Switching/AI quality must stabilize before ranked rollout.
- Discipline/set-piece completion required before competitive launch.
- Authoritative event validation needed before open online tests.

Top risks:
- AI complexity impacts schedule.
- Netcode feel under variable latency.
- Balance churn after special-move introduction.

Mitigations:
- Strict feature flags and staged rollout.
- Daily latency simulation tests.
- Weekly balance council with telemetry gates.

## 7. Definition of Ready (Story Intake)
A story can enter sprint only if:
- Gameplay intent and edge cases are written.
- Acceptance criteria measurable.
- Telemetry events identified.
- Test plan drafted.
- Dependencies identified.

## 8. Definition of Done (Release Gate)
A feature is complete only when:
- Functional + integration tests pass.
- No critical regression in singleplayer flow.
- Relevant docs updated (GDD + checklist + known issues).
- QA scenario pack executed.
- Product owner signs off on user value.

## 9. Future Outlook (Post Sprint 4)
- Clubs/crews social layer.
- Weekly competitive tournaments with anti-smurf controls.
- Cross-platform account progression.
- Replay sharing + creator tools.
- Advanced adaptive AI coach system.
