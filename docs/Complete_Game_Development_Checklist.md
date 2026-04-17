# REDLINE FC - Complete Game Development Checklist

Status scale:
- [ ] Not started
- [~] In progress
- [x] Done

This checklist consolidates all requirements from:
- `Docs/GDD_Redline_FC.md`
- `Docs/MVP_Scope.md`
- `Docs/Technical_Architecture.md`
- `Docs/PreProduction_MasterDoc.md`

## 0. Project Governance and Scope Lock
- [x] Freeze MVP scope (PC, local 2-4 players, Quick Match only, one arena, one ruleset).
- [x] Document explicit non-goals in sprint board (no online, no progression, no offside in MVP, no replay).
- [x] Define acceptance criteria for each MVP pillar (passing feel, tackle fairness, camera readability, low downtime, local clarity).
- [x] Define Definition of Done for gameplay features (code, tests, tuning pass, UX pass, performance pass).
- [x] Set up milestone cadence and review ritual (weekly gameplay validation, risk review, scope control).

## 1. Repository and Build Foundations
- [x] Unity project scaffold committed.
- [x] Core package baseline installed (Input System, TextMeshPro, UGUI, Coplay, Unity MCP).
- [x] Add/verify URP pipeline assets and project graphics consistency.
- [x] Add/verify Cinemachine and Addressables package integration.
- [x] Add versioned project settings policy (what is committed, what is ignored).
- [x] Add CI or scripted local validation (compile + tests).
- [x] Add coding conventions doc for runtime, domain, presentation, tests.

## 2. Scenes and Runtime Entry Points
- [x] Bootstrap scene created and wired as first load scene.
- [x] Match prototype scene playable.
- [x] Frontend scene (main menu + quick match setup) implemented.
- [x] Sandbox scene for experimental systems and debug tools.
- [x] Scene transition flow finalized: Frontend -> Match -> Results -> Frontend.
- [x] Build settings scene order locked and documented.

## 3. Core Domain Architecture (SOLID, module separation)

### 3.1 Match Module
- [x] MatchClock and ScoreState base logic implemented.
- [x] Full match phase state machine implemented (`Bootstrapping`, `TeamIntro`, `KickoffSetup`, `InPlay`, `FoulStopped`, `SetPieceSetup`, `GoalScored`, `HalfTime`, `FullTime`, optional `Overtime`, `Paused`).
- [x] Half-time and full-time transitions with deterministic rules.
- [x] Overtime toggle and sudden death implementation.
- [x] Pause flow and resume flow with clear control lock behavior.

### 3.2 Team Module
- [x] Team roster ownership and spawn grouping.
- [~] Team indicators and team-shared meter integration.
- [~] Team state lifecycle (kickoff, in-play, restart, celebration, reset).

### 3.3 Player Module
- [x] Basic player locomotion and control loop.
- [x] Full player action state machine (`Locomotion`, `Receive`, `Pass`, `Shoot`, `Trick`, `Tackle`, `Stunned`, `KnockedDown`, `Recovering`, `SetPieceControl`).
- [x] Action gating and interruptibility (`Enter`, `Tick`, `Exit`, `CanInterrupt`, `HandleCommand`).
- [x] Ball-carrier movement penalties and sharp-turn vulnerability.
- [~] Face-up defense/strafe mode behavior.

### 3.4 Ball Module
- [~] Ball attach/release/kick baseline implemented.
- [x] Full ball state machine (`Carried`, `FreeRolling`, `AirbornePass`, `AirborneShot`, `Deflected`, `Rebounding`, `OutOfBounds`, `GoalScored`, `RestartAttach`).
- [x] Ownership metadata tracking (`current controller`, `last toucher`, `possession team`, `pass origin`, `shot origin`, `pending target`).
- [~] Hybrid authored + physics trajectory model tuned.
- [x] Deterministic restart ball placement logic.

### 3.5 Combat Module
- [x] Shoulder check resolution.
- [x] Standing tackle resolution.
- [x] Slide tackle resolution.
- [x] Meter-assisted heavy hit resolution.
- [x] Outcomes: stumble/dispossess/knockback/knockdown/wipeout.
- [x] Anti-spam windows: whiff recovery, repeated tackle vulnerability, wake-up protection.

### 3.6 Rules/Referee Module
- [x] Foul classifier by angle/timing/contact context.
- [x] Severity tiers (minor/hard/brutal/knockout event).
- [x] Penalty detection in restricted zone.
- [x] Direct free-kick setup outside penalty area.
- [x] Referee strictness escalation from repeated team fouls.

## 4. Input Architecture and Local Multiplayer
- [x] New Input System action maps: `Global`, `Match`, `SetPiece`.
- [x] Command abstraction implemented (`MoveCommand`, `SprintCommand`, `PassCommand`, `ThroughPassCommand`, `ShootCommand`, `TackleCommand`, `TrickCommand`, `SpecialCommand`, `PauseCommand`).
- [x] Local hot-join with PlayerInputManager for 2-4 controllers.
- [x] Device pairing + assignment service.
- [x] Input profile data-driven tuning support.
- [x] Keyboard fallback and debugging controls (non-shipping path).
- [x] Controller UX pass for onboarding in <= 1 minute.

## 5. Football Gameplay Systems

### 5.1 Movement and Feel
- [~] Tune first-step responsiveness.
- [~] Tune sprint turn penalty.
- [~] Tune possession locomotion drag.
- [~] Tune acceleration/deceleration per archetype profile.

### 5.2 Passing (primary mastery axis)
- [~] Short pass implementation finalized.
- [~] Driven pass implementation finalized.
- [~] Through pass implementation finalized.
- [~] Directional cone targeting + neutral forward preference.
- [~] Limited assist behavior and explicit tunables.
- [~] Pass quality model (facing/distance/pressure/lane/receiver readiness/timing/stability/stats).
- [~] Receiver outcomes (clean/heavy touch/bobble/deflection/loose ball).
- [~] Interception windows and lane contest logic.

### 5.3 Shooting
- [~] Quick shot implementation.
- [~] Charged shot implementation.
- [~] Meter-enhanced shot implementation.
- [~] Shot quality states and block/deflection behavior.

### 5.4 Dribbling and Tricks
- [~] Quick Feint.
- [~] Side Cut.
- [~] Spin Turn.
- [~] Burst Touch.
- [~] Fake Shot / Fake Pass.
- [x] Spam mitigation and failure vulnerability windows.

## 6. Flow Chain, Meter, Momentum
- [ ] Flow Chain pass combo tracker.
- [ ] Combo thresholds:
- [ ] 2 passes -> next pass speed bonus.
- [ ] 3 passes -> increased meter gain.
- [ ] 4 passes -> next shot quality bonus.
- [ ] 5+ passes -> Hot Possession state.
- [ ] Combo break rules (turnover/foul/shot block/out-of-bounds/delay).
- [ ] Team-shared meter capacity and segment rules.
- [ ] Meter gain sources (passes, combos, interceptions, clean tackles, trick success, shots on target, comeback bonus).
- [ ] Meter spend options (Power Tackle, Precision Pass Buff, Power Shot, Recovery Burst).

## 7. Set Pieces, Restarts, Match Pacing
- [~] Basic goal restart loop implemented.
- [~] Kickoff flow fully polished.
- [ ] Sideline quick restart.
- [ ] Corner flow.
- [ ] Goal kick flow.
- [ ] Free kick flow.
- [ ] Penalty kick flow.
- [~] RestartDirector authoritative logic for player/ball placement + control lock + whistle + camera mode.
- [ ] Ensure low downtime target across all restart types.

## 8. Camera and Readability
- [ ] Gameplay camera: keep ball + nearby actors visible.
- [ ] Direction-of-play framing bias.
- [ ] Goal-pressure widening logic.
- [ ] Prevent zoom oscillation and jitter.
- [ ] Set-piece camera logic.
- [ ] Goal celebration camera logic.
- [ ] Impact feedback camera layer.
- [ ] Shared-screen readability pass with 4 local players.

## 9. HUD, Indicators, Feedback
- [~] Basic HUD texts (score/timer/callout) implemented.
- [ ] Production HUD layout (score, timer, meter, possession, flow chain, event callouts).
- [ ] Player indicators and pass target indicators.
- [ ] Team markers and readability colors.
- [ ] Callout priority system (foul/goal/penalty/brutal event).
- [ ] Possession change explicit feedback (audio + visual).
- [ ] Strong tackle impact feedback pass.

## 10. Audio, VFX, Presentation Polish
- [ ] AudioEventCatalog fully wired.
- [ ] VFXCatalog fully wired.
- [ ] Pass contact audio differentiation by pass type.
- [ ] Tackle impact audio and hit-stop feel pass.
- [ ] Crowd heat audio escalation.
- [ ] Goal celebration presentation package.
- [ ] Set-piece short cinematic transitions.

## 11. Data-Driven Content and Tuning Assets
- [~] CharacterData schema finalized.
- [~] TeamData schema finalized.
- [~] MatchRulesetData schema finalized.
- [~] ArenaData schema finalized.
- [~] CameraProfileData schema finalized.
- [~] BallTuningData schema finalized.
- [~] PassTuningData schema finalized.
- [~] TackleTuningData schema finalized.
- [~] ChaosModifierData schema finalized.
- [~] InputProfileData schema finalized.
- [ ] Default balancing data assets created for MVP.

## 12. Characters, Teams, Arena Content
- [ ] 12 unique character slots validated (silhouette readability).
- [ ] 2 teams of 6 characters assembled.
- [ ] Character archetype stats authored and playtested.
- [ ] Single polished MVP arena art pass.
- [ ] Arena gameplay collision and bounds pass.
- [ ] Team color and material unification strategy applied.
- [ ] Animation retargeting baseline for imported characters.

## 13. Asset Governance and Licensing
- [ ] Asset register completed for every external asset.
- [ ] Source URL + license evidence captured.
- [ ] Commercial use validated for every imported asset.
- [ ] Attribution obligations tracked.
- [ ] Risk notes and approval state filled for all assets.

## 14. Frontend and UX Flow
- [~] Main menu screen.
- [~] Quick Match setup (team select / player join / start).
- [ ] Pause menu with resume/restart/quit.
- [ ] Basic options menu (audio/input/gameplay sliders).
- [~] End-of-match results screen.
- [~] Rematch shortcut flow.

## 15. Testing Strategy and Automation

### 15.1 EditMode
- [ ] Pass resolution tests.
- [ ] Tackle legality classifier tests.
- [ ] Meter gain rule tests.
- [ ] Restart selector tests.
- [ ] Combo break condition tests.

### 15.2 PlayMode
- [ ] Kickoff flow test.
- [ ] Goal reset flow test.
- [ ] Penalty setup flow test.
- [ ] Local join flow test.
- [ ] Camera framing sanity test.

### 15.3 Regression and Stability
- [ ] Compile check automation.
- [ ] Smoke test scene load automation.
- [ ] Critical gameplay loop regression test list.

## 16. Performance and Technical Quality
- [ ] Reduce per-frame allocations in gameplay loop.
- [ ] Replace broad scene searches with event dispatch or cached refs.
- [ ] Maintain stable frame pacing during 4-player local matches.
- [ ] GC profile pass in active match.
- [ ] Build and run profiling snapshots for worst CPU/GC frames.

## 17. Compliance to Design Pillars (Gate)
- [ ] Passing is primary mastery axis validated in playtests.
- [ ] Combat creates space without dominating football.
- [ ] High pace / low downtime validated.
- [ ] Readable chaos validated (players understand why events happen).
- [ ] Local multiplayer clarity validated for shared screen.

## 18. MVP Release Candidate Gate
- [ ] No compile errors.
- [ ] No blocker gameplay bugs.
- [ ] One polished arena complete.
- [ ] 12-character roster MVP-ready.
- [ ] Controls onboarding within one minute.
- [ ] Fun/rematch criterion satisfied in test sessions.
- [ ] Build reproducibility documented.
- [ ] Known issues list and post-MVP backlog prepared.

## 19. Post-MVP Backlog (Do not pull into MVP unless approved)
- [ ] Online multiplayer architecture.
- [ ] Additional arenas.
- [ ] Expanded roster.
- [ ] More chaos modifiers.
- [ ] Replay system.
- [ ] Ranked/cups/progression/cosmetics.

## 20. Execution Plan (Step-by-Step Delivery Order)
- [x] Step 1: Stabilize runtime foundations (scene flow, module boundaries, data schemas).
- [x] Step 2: Finalize local multiplayer input and command routing.
- [~] Step 3: Lock movement + passing feel (core loop quality bar).
- [x] Step 4: Implement shooting, tackles, dispossession and foul classifier.
- [~] Step 5: Implement restart/set-piece ecosystem and pacing polish.
- [ ] Step 6: Implement Flow Chain + meter complete behavior.
- [ ] Step 7: Implement camera stack and readability guarantees.
- [ ] Step 8: Implement full HUD/indicators/callouts and feedback polish.
- [ ] Step 9: Integrate characters/arena content and unification pipeline.
- [ ] Step 10: Complete tests, performance passes, and MVP release gate.

## Step Verification Log
### Step 1 verification (2026-04-16)
- [x] Compile gate passed (`No compile errors` via Unity MCP).
- [x] Bootstrap scene exists at `Assets/_Project/Scenes/Bootstrap/Bootstrap.unity`.
- [x] Bootstrap runtime loader exists (`BootstrapFlow` with `MatchBootstrapService`).
- [x] Runtime flow test passed: Play from Bootstrap auto-transitions into `MatchPrototype`.
- [x] Build settings committed with Bootstrap first and MatchPrototype second.
- [x] Cinemachine and Addressables packages are installed in `Packages/manifest.json`.
- [x] Project settings/versioning policy documented (`Docs/Project_Settings_Policy.md`).
- [x] Coding conventions documented (`Docs/Coding_Conventions.md`).
- [x] Scripted local validation added (`Tools/local-validate.ps1`).
- [x] URP is installed and wired as active render pipeline in project settings (`GraphicsSettings.asset`, `QualitySettings.asset`).
- [x] URP default renderer data exists and is bound (`Assets/_Project/Settings/UniversalRendererData.asset`).
- [x] Input handling switched to Input System only (`ProjectSettings.asset` -> `activeInputHandler: 1`).

### Step 2 verification (2026-04-16)
- [x] Compile gate passed after Input System migration (`No compile errors` via Coplay MCP).
- [x] Runtime command stack created in match scene at play (`InputCommandRouter`, `InputDeviceAssignmentService`, `InputActionMapSwitcher`).
- [x] Input actions asset created and wired (`Global`, `Match`, `SetPiece` via `Resources/RedlineInput`).
- [x] Player input facade routes through Input System action map and retains keyboard debug fallback.
- [x] Local hot-join service uses `PlayerInputManager` with controller join trigger (`Start`) for up to 4 players.
- [x] Device pairing and assignment service maps `InputDevice` <-> `playerId`.
- [x] Input profile tuning is consumed by input facade (`InputProfile_Default`).
- [x] Onboarding hint for controls/join is visible on HUD during match start (<= 60 seconds).

### Governance + Step 3/4/5 baseline verification (2026-04-16)
- [x] Governance document added: `Docs/Governance_MVP_Execution.md`.
- [x] Compile check passed (`No compile errors` via Unity MCP).
- [x] Unity Play Mode in `MatchPrototype` validated.
- [x] Restart flow baseline validated via `MatchContext.RegisterGoal` -> `IsRestartPending` set `true`.
- [x] Screenshot captured: `Assets/Screenshots/playtest_matchprototype_step3.png`.
- [x] Screenshot captured: `Assets/Screenshots/playtest_step5_restart_pending.png`.

### Scene Flow verification (2026-04-16)
- [x] Frontend scene created at `Assets/_Project/Scenes/Frontend/Frontend.unity` with `FrontendFlowController`.
- [x] Results scene created at `Assets/_Project/Scenes/Frontend/Results.unity` with `ResultsFlowController`.
- [x] Match scene wired with `MatchResultsFlowController` (`Assets/MatchPrototype.unity`).
- [x] Build settings updated to 4 scenes: Bootstrap, Frontend, MatchPrototype, Results.
- [x] Bootstrap scene `MatchBootstrapService.targetSceneName` set to `Frontend`.
- [x] Playmode flow validated end-to-end: Bootstrap -> Frontend -> MatchPrototype -> Results -> Frontend.
- [x] Screenshot captured: `Assets/Screenshots/playtest_sceneflow_frontend.png`.
- [x] Screenshot captured: `Assets/Screenshots/playtest_sceneflow_results.png`.

### Sandbox scene verification (2026-04-16)
- [x] Sandbox scene created at `Assets/_Project/Scenes/Sandbox/Sandbox.unity`.
- [x] `SandboxDebugController` added and runtime overlay available.
- [x] Build settings include Sandbox scene.
- [x] Playmode validation performed in Sandbox.

### Section 3.1 Match Module verification (2026-04-16)
- [x] `MatchPhase`, `PauseState`, and `MatchStateMachine` implemented and integrated in `MatchContext`.
- [x] Compile check passed (no compile errors).
- [x] Playmode validation in `Assets/MatchPrototype.unity` confirmed active `InPlay` phase.
- [x] Pause ownership lock validated (`RequestPause(0)` pauses, `ResumePause(1)` denied, `ResumePause(0)` succeeds).
- [x] Goal transition validation confirmed `RegisterGoal` drives `KickoffSetup` with pending restart.
- [x] Screenshot captured: `Assets/Screenshots/playtest_section3_1_matchmodule.png`.

### Section 3.2 Team Module verification (2026-04-16)
- [x] Team domain models implemented: `TeamRoster`, `TeamSpawnPlan`, `TeamState`, `TeamMeterState`.
- [x] `TeamRuntimeService` integrated through `MatchContext` and auto-resyncs roster when players spawn.
- [x] Compile check passed (no compile errors).
- [x] Playmode validation in `Assets/MatchPrototype.unity` confirmed roster counts (`Acount=1`, `Bcount=1`).
- [x] Goal transition check confirmed team lifecycle and restart handoff (`phase=KickoffSetup`, pending restart true).
- [x] Screenshot captured: `Assets/Screenshots/playtest_section3_2_teammodule_v2.png`.

### Section 3.3 Player Module verification (2026-04-16)
- [x] `PlayerActionState` and `PlayerActionStateMachine` implemented with full required state set.
- [x] `PlayerController` integrated with `PlayerMotor` movement path and action gating.
- [x] Compile check passed (no compile errors).
- [x] Playmode action-state transition validation: `Locomotion -> Tackle -> Stunned -> KnockedDown`.
- [x] Ball-carrier penalty validation: `GetEffectiveMaxSpeed` reduced from `6.50` to `5.53` after attach.
- [x] Screenshot captured: `Assets/Screenshots/playtest_section3_3_playermodule.png`.

### Section 3.4 Ball Module verification (2026-04-16)
- [x] `BallContext` implemented with ownership metadata fields and reset/release APIs.
- [x] `BallStateMachine` implemented with full state set (`Carried`, `FreeRolling`, `AirbornePass`, `AirborneShot`, `Deflected`, `Rebounding`, `OutOfBounds`, `GoalScored`, `RestartAttach`).
- [x] `BallActor` integrated with context/state machine and goal/deflection hooks.
- [x] `GoalTriggerRelay` now marks goal-scored state before score registration.
- [x] Compile check passed (no compile errors).
- [x] Playmode validation confirmed transitions (`FreeRolling -> Carried -> AirbornePass/AirborneShot -> GoalScored`) and metadata updates (`carrier/shotOrigin/lastToucher`).
- [x] Screenshot captured: `Assets/Screenshots/playtest_section3_4_ballmodule.png`.

### Section 3.5 Combat Module verification (2026-04-16)
- [x] `TackleResolver` covers all four tackle action types and outcome resolution path.
- [x] `HitResolutionService` implemented for impact translation and feedback event emission.
- [x] `KnockdownService` implemented with stun/knockdown/recovering/wakeup-protected lifecycle.
- [x] Compile check passed (no compile errors).
- [x] Runtime resolver validation executed for all tackle types; heavy-hit foul path validated (`heavyFoul=True`).
- [x] Knockdown validation confirmed (`isDown=True`, `remaining=1.00`).
- [x] Screenshot captured: `Assets/Screenshots/playtest_section3_5_combatmodule.png`.

### Section 3.6 Rules/Referee Module verification (2026-04-16)
- [x] `FoulClassifier` integrates classification by angle/timing/protected-state/zone and restart outcome mapping.
- [x] `DisciplineTracker` implemented and integrated for team strictness escalation.
- [x] `RulesEngineService` implemented as rule-coordination wrapper.
- [x] Compile check passed (no compile errors).
- [x] Runtime validation: brutal foul resolves to `FreeKick`, knockout event in penalty resolves to `PenaltyKick`.
- [x] Strictness escalation validated (`strict=1.26` after repeated fouls on team 0).
- [x] Screenshot captured: `Assets/Screenshots/playtest_section3_6_rulesmodule.png`.

### Step 4 completion verification (2026-04-16)
- [x] Compile check passed after Step 4 gameplay refinements (`No compile errors` via Unity MCP).
- [x] Resolver behavior verified: tackle/dispossession/knockdown paths validated (`TackleResolver`, `HitResolutionService`, `KnockdownService`).
- [x] Rules pipeline verified: foul classification and restart mapping validated (`FoulClassifier`, `DisciplineTracker`, `RulesEngineService`).
- [x] Shooting resolver check completed: `ShotResolver` now resolves block/deflection via contextual pressure + quality decision path.
- [x] Runtime evidence reused from Section 3.5 and 3.6 verification captures.
- [x] Screenshot captured: `Assets/Screenshots/playtest_section3_5_combatmodule.png`.
- [x] Screenshot captured: `Assets/Screenshots/playtest_section3_6_rulesmodule.png`.

### Section 5.4 Dribbling and Tricks verification (2026-04-16)
- [x] `TrickResolver` implemented with five trick types and outcome model (`Success`, `FailedSpam`, `FailedNoControl`).
- [x] Input trick routing wired through `InputCommandRouter` + `PlayerInputFacade` + `PlayerController.TriggerTrick`.
- [x] Compile check passed (no compile errors).
- [x] Runtime resolver validation confirmed outcomes: `noBall=FailedNoControl`, `success=Success`, `spam=FailedSpam`.
- [x] Screenshot captured: `Assets/Screenshots/playtest_section5_4_tricks.png`.
