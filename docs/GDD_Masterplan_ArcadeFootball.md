# REDLINE FC - Game Design Document (GDD) Masterplan

Version: 1.0
Date: 2026-04-17
Status: Product + Design + Systems Blueprint

## 1. Vision and Product Thesis
REDLINE FC soll ein schnell lesbares, mechanisch tiefes, fair kompetitives Arcade-Fussballspiel werden, das die Zugänglichkeit von FIFA-artigen Controls mit der Wildheit von Street/Arcade kombiniert.

North Star:
- 90 Sekunden bis "Spaßmoment" für neue Spieler.
- 30+ Stunden Skill-Lernkurve für kompetitive Spieler.
- 5-Minuten Matches für hohe Session-Frequenz.
- Singleplayer, der sich nicht nach "nur gegen dumme Bots" anfühlt.
- Online Multiplayer als langfristiger Wachstumsmotor.

Core Fantasy:
- "Ich bin Captain einer aggressiven, stylischen Mannschaft."
- "Jeder Angriff kann eskalieren: Combo, Special, harter Zweikampf, Red Card-Moment."
- "Mein Team spielt intelligent mit, nicht gegen mich."

## 2. Genre Positioning
Positioning: "Competitive Arcade Football"

Inspirations (gezielt, nicht kopiert):
- EA SPORTS FC: Rollen-/Verhaltensidentität für Spieler.
- Mario Strikers: Chaotische Match-Situationen, Specials, High-Impact-Momente.
- Rocket League/Sideswipe-Denke: kurze Matches, starke Skill-Expression, klare Meta-Layer.

Differenzierung von REDLINE FC:
- Team-KI und automatischer Kontrollwechsel sind Kernqualität, nicht Nebenfeature.
- Foul-/Card-System ist mechanisch relevant (nicht nur kosmetisch).
- Special-Moves sind risk/reward, nicht reine RNG-Gewinnknöpfe.
- Online-Modi werden von Anfang an netcode- und replay-fähig gedacht.

## 3. Target Audience
Primary:
- 16-35, kompetitive Action- und Fussballfans, kurze Sessions, hoher Skillfokus.

Secondary:
- Casual Couch-Players, die sofort loslegen wollen.

Tertiary:
- Creator/Streamer (Highlight-Momente, Clutch-Plays, Red-Card-Drama, Spektakel).

## 4. Core Experience Pillars
1. Readable Chaos
- Schnell, aber immer lesbar.
- Jede Eskalation (Foul, Special, Konter) bleibt telegraphed.

2. Team Intelligence
- Mitspieler laufen intelligent mit, öffnen Passlinien, antizipieren Rebounds.

3. Skill + Style
- Mechanische Tiefe: Timing, Positioning, Switching, Risk Management.
- Stilmittel: Signature Moves, Team-Archetypen, Audio-Visual Impact.

4. Fair Competition
- Gute Spieler gewinnen langfristig.
- Variabilität durch Systemtiefe, nicht durch unfairen RNG-Overload.

## 5. Match Format and Ruleset
Default Competitive Ruleset:
- 3v3 (später 4v4 Playlist optional).
- 2 Halften (Default 3:00/3:00; Ranked-Varianten konfigurierbar).
- Overtime + Sudden Death bei Draw.
- Fouls, Gelb/Rot aktiv.
- Penalty-Flow vollständig ausspielbar (Roadmap: kurzfristig bauen).

Arcade Variant Ruleset (separate queue):
- Höhere Special-Rate.
- Mehr aggressive Kollisionen.
- Kürzere Cooldowns.
- Für Events/Party Modes.

## 6. Input, Control and QoL Design
### 6.1 Input Philosophy
- Low floor: Standard-Input schnell lernbar.
- High ceiling: Advanced Inputs und Decision-Making für Pros.

### 6.2 Auto Player Switch (Singleplayer)
Problem heute: falscher aktiver Spieler, Team wirkt "tot".

Ziel:
- Ohne Ballbesitz wird automatisch auf den taktisch besten Verteidiger gewechselt.
- Mit Ballbesitz bevorzugt der Ballträger; bei losem Ball der beste Interceptor.

Switch Scoring Model (pro Teammate):
- Distance to ball (Gewicht hoch)
- Intercept angle to ball trajectory
- Facing alignment to play direction
- Sprint stamina availability
- Role suitability (Defender/Anchor Bonus bei Defense, Striker Bonus bei Attack)
- Danger zone priority (Penalty area threat)

Anti-Frust Regeln:
- Hysterese (kein Flackern zwischen Spielern)
- Minimum hold time (z.B. 350ms)
- Forced switch only on clear advantage threshold
- Manual override via Tab jederzeit

Acceptance Criteria:
- In 90% der Defensivsituationen fühlt sich der Auto-Switch "richtig" an.
- <5% ungeplante Doppelswitches in Telemetrie.

### 6.3 Assisted Team Controls
Optional Assist Toggles:
- Smart Through Pass Assist
- Contextual Shoot Assist (nur Zielhilfe, kein Auto-Goal)
- Defensive Contain Assist (casual playlists)

Ranked Policy:
- Striktes Assist-Profil pro Queue, server-seitig erzwungen.

## 7. AI Teammate and Opponent Design
### 7.1 Teammate AI (critical sales-quality feature)
Behaviors:
- Off-ball run templates (diagonal, overlap, safety lane, decoy run)
- Dynamic support triangles around ball
- Threat-aware retreat when possession lost
- Opportunistic press in high-danger zones

Decision Layers:
1. Tactical role intent (Captain archetype + team setup)
2. Context intent (attack, transition, defense, set-piece)
3. Micro action (run, mark, challenge, receive)

### 7.2 Opponent AI Difficulty Model
Nicht nur "mehr Speed":
- Better anticipation windows
- Better pressing traps
- Better foul discipline
- Better special timing

Difficulty Tiers:
- Rookie, Street, Pro, Elite, Nightmare

## 8. Combat, Fouls, Cards, Discipline
### 8.1 Foul Taxonomy
- Light foul: mistimed body contact
- Tactical foul: stoppt klaren Vorteil
- Reckless foul: hohes Tempo + schlechter Winkel
- Violent foul: wiederholte harte Treffer / extremes Timing

### 8.2 Card System
- Yellow triggers on tactical/reckless foul conditions.
- Red triggers on:
  - second yellow
  - direct violent foul
  - denial of obvious goal chance

### 8.3 Gameplay Impact
- Yellow: aggressiveness penalty + risk modifier
- Red: Spieler vom Feld, Team in Unterzahl
- Optional replacement rules by mode (competitive strict vs arcade forgiving)

### 8.4 Penalty and Set-Piece Depth
Must-have (kurzfristig):
- Full penalty sequence (shooter aim/timing vs keeper guess/timing)
- Throw-in, corner, free-kick mini-state machines
- Non-kicker lock during set-piece until execute window

## 9. Special Moves System (Arcade Signature)
### 9.1 Momentum Meter
Gain sources:
- Successful tackles
- One-touch pass chains
- Skill dribbles
- Clutch saves/intercepts

Spend categories:
- Power Shot
- Precision Through Ball
- Team Blitz Press
- Recovery Burst
- Signature Captain Move

### 9.2 Signature Moves (per captain archetype)
Examples:
- Blitz: "Neon Break" (burst dribble + shot buff)
- Tank: "Iron Wall" (short invuln tackle window)
- Pixel: "Thread Needle" (curve pass with interception penalty)

Balance Guardrails:
- Hard cooldowns
- Counterplay windows
- No unreactable guaranteed goals

## 10. Modes and Feature Set
### Launch Core
- Quick Match 1vCPU, 1v1 Local, 2v2 Local (controller roadmap)
- Challenge Ladder (PvE seasons)
- Practice Arena + Tutorial Drills

### Online Core (Phase 2)
- Ranked 3v3 (solo/duo queue)
- Unranked Casual
- Private Lobbies + Spectator Slots
- Replays + Highlight Export

### Live Service (Phase 3+)
- Clubs/Crews (persistent team identity)
- Weekly cups/tournaments
- Seasonal battle pass (cosmetic only)
- Limited-time arcade mutators

## 11. Progression, Economy, and Retention
Design Principles:
- Skill-first progression
- Cosmetic monetization, no pay-to-win
- Daily loop + weekly mastery loop + seasonal chase

Progression Layers:
1. Account Level (global)
2. Captain Mastery Tracks
3. Team Chemistry/Playbook Unlocks (non-stat unfair)
4. Seasonal Ranked Rewards

Economy:
- Soft currency: earned via play
- Premium currency: cosmetics/bundles
- Strict gameplay fairness policy

Retention Features:
- First win of day bonus
- Weekly role challenges
- Limited-time event cards (visual themes only)
- Returning player catch-up bundle (non-P2W)

## 12. Online Multiplayer and Netcode Plan
Architecture Recommendation:
- Authoritative dedicated server for ranked integrity.
- Client prediction + reconciliation for player responsiveness.
- Snapshot interpolation for remote entities.
- Selective rollback/replay for collision-critical windows.

Why this approach:
- Reduces cheating and desync frustration.
- Scales better than pure peer-to-peer for competitive mode.

Network Targets:
- Input-to-action feel <90ms perceived in normal ping buckets.
- 60 Hz simulation target where feasible.
- Graceful degradation under packet loss (jitter buffer + prediction limits).

Anti-cheat & Integrity:
- Server authority on outcomes (goals/fouls/cards/special activations).
- Deterministic validation of key events.
- Input sanity checks and anomaly detection.

## 13. UX, Accessibility, and Social Features
Accessibility:
- Full remapping
- High-contrast HUD mode
- Colorblind palettes
- Reduced camera shake option
- Subtitle + callout scaling

Social:
- Party system
- Team quick-chat wheel (non-toxic presets)
- End-of-match commendations
- Report/mute pipeline

Creator Features:
- Cinematic replay moments
- Clip export templates
- Match timeline overlay (goals/cards/specials)

## 14. Content and Art Direction
Art Style:
- Stylized urban-arena football
- Strong team color readability
- Dramatic lighting and bold silhouettes

Audio Pillars:
- Punchy impact SFX
- Distinct foul/card sonic signatures
- Signature move audio motifs
- Crowd reactivity tied to momentum swings

## 15. Telemetry, KPIs, and Product Success
Gameplay KPIs:
- Match completion rate
- Comeback frequency
- Average goals/match
- Foul and red-card frequency distribution
- Auto-switch override rate (QoL health metric)

Product KPIs:
- D1/D7/D30 retention
- Session length and sessions/day
- Ranked participation rate
- Conversion to social/party play

Quality KPIs:
- Desync incidents / 1k matches
- Rage quit rate by mode
- Input frustration survey score

## 16. Production Roadmap (Suggested)
### Phase A - Core Gameplay Excellence (0-8 weeks)
- Auto-switch 2.0
- Teammate AI runs/support
- Full set-piece states
- Complete card/foul discipline pass
- Penalty flow full implementation

### Phase B - Competitive Foundation (8-16 weeks)
- Ranked rule tuning
- Replay system v1
- Matchmaking v1
- Anti-cheat baseline

### Phase C - Online Scale + LiveOps (16-28 weeks)
- Clubs, seasonal progression, events
- Tournament framework
- Cosmetic store + pass

### Phase D - Innovation Layer (28+ weeks)
- Advanced crowd/arena dynamics
- Adaptive AI coach layer
- Community UGC presets for custom arcade rules

## 17. Prioritized Feature Backlog (Top 20)
P0 (must):
1. Auto player switch intelligence overhaul
2. Teammate off-ball support AI
3. Full penalty sequence
4. Set-piece lockdown and flow
5. Yellow/Red card rules with gameplay consequence
6. Foul readability VFX/SFX
7. Replay timeline events
8. Input buffer and responsiveness polish

P1 (high value):
9. Signature move system per captain
10. Momentum meter with fair counters
11. Ranked playlist rule lock
12. Practice drills and advanced tutorial
13. Matchmaking + party queue
14. Spectator + private lobby

P2 (growth):
15. Seasonal progression
16. Clubs mode
17. Weekly tournaments
18. Creator clip export
19. Accessibility expansion
20. Live balancing dashboard

## 18. Design Risks and Mitigations
Risk: Too much chaos kills fairness.
Mitigation: Separate competitive and arcade rulesets; strict ranked tuning.

Risk: AI teammates feel dumb.
Mitigation: Role-based intent + telemetry on support quality + iteration budget.

Risk: Specials become unbalanced.
Mitigation: hard counters, cooldown caps, usage analytics, ranked-specific nerf tables.

Risk: Netcode trust loss.
Mitigation: early server-authoritative prototypes + replay-based desync auditing.

## 19. Concrete Implementation Notes for Current Codebase
For `src/game` next iterations:
- `playerControl.ts`: replace nearest-ball only with weighted switch score + hysterese.
- `AI.ts`: add off-ball intent states (support, overlap, cover, press trap).
- `Match.ts`: complete set-piece substates and discipline events.
- `Combat.ts`: map foul class -> card decision model.
- `HUD.ts`: visible discipline and advantage indicators.
- Add integration tests for switching, foul/card escalation, set-piece transitions.

## 20. Competitive Tuning Defaults (Initial Proposal)
- Match length (ranked): 2x3:00
- Overtime: 1:00, then sudden death
- Yellow threshold: 2 reckless/tactical equivalents
- Red direct: violent foul or DOGSO
- Special meter gain multiplier in ranked: 0.85 (compared to arcade 1.00)

## 21. Reference Inputs (Research)
- EA FC IQ / Player Roles deep dive (team behavior and role identity):
  - https://www.ea.com/th/games/ea-sports-fc/fc-25/news/pitch-notes-fc-25-fc-iq-deep-dive
- EA FUT deep-dive patterns for live events/evolutions/engagement loops:
  - https://www.ea.com/en/games/ea-sports-fc/fc-25/news/pitch-notes-fc-25-football-ultimate-team-deep-dive
  - https://www.ea.com/th/games/ea-sports-fc/fc-26/news/pitch-notes-fc26-fut-deep-dive
- Mario Strikers inspiration context for hyper/special-chaos football:
  - https://en.wikipedia.org/wiki/Mario_Strikers%3A_Battle_League
- Rollback networking baseline:
  - https://www.ggpo.net/
- Web real-time transport fundamentals:
  - https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels
  - https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel
- Snapshot interpolation / network smoothness design:
  - https://gafferongames.com/post/snapshot_interpolation/

## 22. Definition of Done for "Super-Sauber" Milestone
A release candidate is "super-sauber" only if all are true:
- Team AI support score > target threshold in telemetry.
- Auto-switch complaint rate < defined target.
- Ranked desync rate below threshold.
- Foul/card outcomes statistically balanced.
- New player onboarding completion > 80%.
- D7 retention target achieved in beta cohorts.

## 23. Companion Documents
- Execution plan (next 4 sprints):
  - `docs/Execution_Backlog_4_Sprints.md`
- Balance operations handbook:
  - `docs/Balance_Bible_REDLINE_FC.md`
