# REDLINE FC - Balance Bible

Version: 1.0
Date: 2026-04-17
Purpose: Authoritative balancing and gameplay fairness guide for design, engineering, QA, and live-ops.

## 1. Balance Philosophy
Primary principle: Competitive integrity first, arcade spectacle second, randomness last.

Target outcomes:
- Better players should win over sample size.
- Casual players should still produce highlight moments.
- Every powerful mechanic must have a readable counterplay.

## 2. Core Match Pacing Targets
- Match length (ranked): 2x3:00
- Overtime: 1:00, then sudden death
- Ideal goals per match: 3.8-5.2 average
- Ideal shot conversion: 22-32%
- Foul frequency: 8-14 per match
- Red cards: 0.1-0.5 per match average

Interpretation:
- If goals > 6.0 consistently -> defensive tools too weak or specials too dominant.
- If goals < 2.5 consistently -> attack creativity or shot quality too low.

## 3. Player Control and QoL Standards (FIFA-like Expectations)
These are expected standards for modern football controls and must exist in options.

### 3.1 Switching and Defensive QoL
- Auto-switch modes: Ball Relative / Air Balls / Loose Ball Priority.
- Switching sensitivity slider.
- Right-stick manual switch option (advanced).
- Pass target lock indicator and next switch candidate highlight.

### 3.2 Passing and Shooting Assistance Profiles
Per-profile controls:
- Passing assist: Assisted / Semi / Manual
- Through ball assist: Assisted / Semi / Manual
- Shooting assist: Assisted / Semi / Manual
- Cross assist: Assisted / Semi / Manual

Queue policy:
- Casual queues: profile free choice.
- Ranked queues: restricted profile set to preserve fairness.

### 3.3 Movement and Input Comfort
- Sprint: Hold or Toggle option.
- Input buffer windows per action type.
- First touch sensitivity setting.
- Camera options (distance/height/zoom responsiveness).
- UI scale and color presets.

### 3.4 Readability Standards
- Ball visibility must remain clear under all VFX states.
- Active player ring always visible.
- Card/foul advantage indicator appears within 200ms of decision.
- No overlay should hide immediate input hints in early onboarding modes.

## 4. Team AI Balance Framework
### 4.1 Off-ball Intelligence Metrics
Track and tune:
- Support availability rate (>=2 outlets in attack)
- Defensive shape integrity score
- Ball-chase collapse incidents
- Wrong-switch frustration events

### 4.2 AI Decision Priority (recommended)
Attack without ball:
1. Maintain role lane
2. Create progressive passing lane
3. Time overlap if cover exists
4. Pull marker if no lane available

Defense without ball:
1. Protect high-danger channel
2. Nearest pressure only if cover established
3. Delay and funnel attacker wide
4. Prevent central breakaways first

## 5. Contact, Foul, and Card Tuning
### 5.1 Contact Inputs
Variables:
- contact angle
- relative speed
- possession state
- location danger (DOGSO probability)
- recent foul history

### 5.2 Foul Classification
- Light foul: minor mistime
- Tactical foul: intentional stop of progression
- Reckless foul: speed + bad angle + high impact
- Violent foul: extreme impact or repeated reckless behavior

### 5.3 Card Decisions
- Yellow for tactical/reckless weighted threshold.
- Direct red for violent fouls or DOGSO events.
- Second yellow -> red.

### 5.4 Balance Guardrails
- If players avoid tackling entirely: foul penalties too harsh.
- If spam tackling dominates: foul penalties too soft.
- Tune to preserve meaningful defensive aggression.

## 6. Set-Piece and Penalty Balancing
### 6.1 Penalty Sequence
Shooter variables:
- aim precision window
- power meter granularity
- fake timing risk

Keeper variables:
- read bonus from shot telegraph
- dive timing window
- stamina/previous move penalty

Targets:
- Penalty conversion: 62-78% depending on skill tier.
- Save should feel skillful, not random.

### 6.2 Set-Piece Restart Fairness
- Non-kicker lock until execute window.
- Restart timer prevents stalling abuse.
- Defensive auto-positioning to avoid cheap goals.

## 7. Special Moves and Meter Economy
### 7.1 Meter Design
Gain sources should reward skill execution:
- successful tackle timing
- passing combos
- clean intercepts
- controlled dribble success

Loss/decay:
- passive decay when inactive
- turnover penalties for failed high-risk specials

### 7.2 Special Tiering
Tier 1: utility burst (low cost)
Tier 2: tactical swing (medium cost)
Tier 3: signature captain move (high cost, high commitment)

### 7.3 Counterplay Rules
- Startup telegraph mandatory.
- Interrupt windows documented.
- Recovery vulnerability after failed special.

### 7.4 Ranked Restrictions
- Reduce meter gain multiplier in ranked.
- Disable high-RNG modifiers in ranked playlists.

## 8. Stamina and Fatigue
Desired effect:
- Sprint and aggressive defense require management.
- Exhaustion punishes constant full-press behavior.

Targets:
- Full sprinting continuously should not be sustainable for entire half.
- Recovery should reward smart pacing and substitutions (future mode depth).

## 9. Role and Archetype Balance
### 9.1 Role Identity
- Striker: finishing + movement burst
- Playmaker: pass quality + vision angle
- Defender/Anchor: interception + physical control
- Hybrid: moderate all-around with lower peak strengths

### 9.2 Balance Rule
No archetype should exceed +12% net win rate across MMR buckets without planned meta event.

### 9.3 Meta Health Checks
Monitor by bracket:
- pick rate
- win rate
- contribution metrics (xG chain, defensive interventions)

## 10. Online Fairness and Netcode Tuning
### 10.1 Core Policy
- Server authoritative for all critical outcomes.
- Prediction for local responsiveness.
- Reconciliation with smoothing thresholds.

### 10.2 Latency Buckets (for tuning reports)
- 0-30ms (ideal)
- 31-60ms (good)
- 61-90ms (playable)
- 91-130ms (degraded)
- 130ms+ (fallback compensation profile)

### 10.3 Competitive Integrity Controls
- Input delay normalization policies by queue.
- Quit/disconnect resolution policy fixed and transparent.
- Anti-smurf and anti-exploit telemetry hooks.

## 11. Camera and Presentation Balance
Camera standards:
- Keep at least 80% of active tactical area visible during transitions.
- Ball and active player must not overlap with opaque HUD in default settings.
- Camera smoothing should not delay reaction readability.

FX standards:
- Goal/special/foul effects are high impact but short and non-obstructive.
- Competitive mode can reduce non-critical VFX intensity.

## 12. Audio Mix Balance
- Core gameplay cues (pass, tackle, foul whistle) must always cut through ambience.
- Crowd mix should react dynamically but never mask critical cues.
- Dynamic ducking on whistle/card/penalty events.

## 13. Live Balancing Operations
### 13.1 Weekly Balance Cadence
- Monday: telemetry snapshot
- Tuesday: design review and candidate changes
- Wednesday: sandbox simulation + QA mini-cup
- Thursday: patch decision
- Friday: communication + deployment

### 13.2 Patch Safety Ladder
1. Config-only tuning
2. Small systemic tweaks
3. Major mechanic changes (requires playtest wave)

### 13.3 Change Budget (per patch)
- Max 2 major gameplay variables per patch in ranked.
- Remaining changes should be minor to keep meta readable.

## 14. QA Scenarios (Mandatory)
- Auto-switch stress (loose ball chaos)
- Defensive containment under stamina depletion
- Penalty sequence fairness (100-shot sample)
- Card escalation (yellow->red edge cases)
- Special counterplay interruptions
- High ping simulation with repeated challenges

## 15. KPI Targets and Alert Thresholds
Healthy targets:
- Match completion > 88%
- Rage quit < 9%
- Desync critical incidents < 0.8 per 1k matches
- Ranked rematch/next-match click-through > 62%

Alert triggers:
- Any archetype > 55% winrate over sample threshold
- Card rate spikes > 25% week-over-week
- Input frustration reports up > 15% week-over-week

## 16. Future Balance Expansion
- 4v4 mode pace retune pack
- Weather/arena modifier queue (casual only)
- Adaptive AI role learning for PvE events
- Tournament rulesets with pick/ban archetypes

## 17. Change Log Template (for every balance patch)
- What changed
- Why it changed
- Expected impact
- Known risks
- What we monitor next

This template must be mandatory for release notes and internal review.
