> Historical note: this document still contains Unity-era planning/reference material. It is not the primary source of truth for the current web prototype unless and until it is rewritten. Prefer `README.md`, `BUILD.md`, `docs/Technical_Architecture.md`, `docs/Complete_Game_Development_Checklist.md`, `docs/web-release-checklist.md`, and `KNOWN_ISSUES.md` for current status.

# REDLINE FC — Game Design Document

## 1. High Concept
REDLINE FC is a fast, chaotic, skill-based arcade football game where passing, positioning, and tricks are just as important as aggressive tackles and combat mechanics.

It is:
- not a simulation football game
- not a pure fighting game
- a football-combat hybrid with strong arcade feel and high player expression

Core fantasy:
> Illegal high-impact arena football where stylish playmaking and controlled aggression win matches.

## 2. Design Pillars
### 2.1 Passing is the primary mastery axis
Passing must be intentional, directional, readable, and satisfying. Great teams should dominate through movement and pass sequencing, not just raw collision pressure.

### 2.2 Combat creates space
Combat is a tactical disruption layer used to challenge possession, close passing lanes, and punish greed. It must support football, not replace it.

### 2.3 High pace, low downtime
Players should spend very little time waiting. Restarts should be fast, possession should shift often, and every action should push the match toward a meaningful outcome.

### 2.4 Readable chaos
The game can be wild, but the player must always understand why a foul, goal, interception, knockdown, or special event occurred.

### 2.5 Local multiplayer first
All gameplay, UI, camera, and pacing decisions are optimized for shared-screen readability and controller accessibility.

## 3. Player Experience Goals
Players should feel:
- smart when they create a passing lane
- powerful when they land a clean tackle
- punished when they commit recklessly
- rewarded for one-touch play and coordinated setups
- excited by dramatic momentum swings and cinematic finishes

The ideal player reaction is:
- That was my setup.
- I read that pass.
- I got punished for greed.
- Run it back.

## 4. Match Format
Recommended MVP defaults:
- Mode: Quick Match
- Platform: PC only
- Team size: 4v4 default, scalable internally to 3v3–6v6
- Local players: 2–4
- Match length: 2 halves x 3 minutes
- Overtime: optional 1-minute sudden death
- Arena count: 1

## 5. Match Flow
1. Kickoff
2. Midfield possession contest
3. Build-up via movement and passing
4. Defensive disruption via tackling/combat
5. Shot attempt, turnover, foul, or out-of-bounds
6. Restart
7. Repeat until final whistle

Restarts supported in MVP:
- Kickoff
- Sideline quick restart
- Corner
- Goal kick
- Free kick
- Penalty kick

## 6. Core Gameplay Systems
### 6.1 Movement
Movement must be responsive, readable, and tuned for fast local multiplayer.

Supported movement states:
- Idle
- Jog
- Sprint
- Strafe/face-up defense
- Possession locomotion
- Trick state
- Pass state
- Shot state
- Tackle commitment state
- Stunned
- Knocked down
- Recovery

Rules:
- first-step responsiveness is prioritized over realism
- sprint is strong but reduces turning quality
- ball carriers move slightly slower at peak speed
- sharp turns with the ball increase vulnerability
- strafing improves facing control and receiving stability

### 6.2 Passing
Passing is the core skill expression.

MVP pass types:
1. Short Pass
2. Driven Pass
3. Through Pass

Input model:
- Tap pass = Short Pass
- Hold pass = Driven Pass
- Modifier + pass = Through Pass

Aiming model:
- directional cone targeting
- neutral input favors best teammate in forward cone
- directional input biases teammate or space selection
- assist exists but is intentionally limited

Pass quality factors:
- passer facing vs pass direction
- distance
- pressure
- lane occupancy
- receiver readiness
- timing quality
- passer stat
- body balance at release

Receiver outcomes:
- clean control
- heavy touch
- bobble
- deflection
- loose ball

Interception rules:
- defenders occupying lanes can contest or steal
- active interception improves result window
- driven passes are harder to stop cleanly
- through passes reward anticipation

Flow Chain combo bonuses:
- 2 passes: next pass speed bonus
- 3 passes: increased meter gain
- 4 passes: next shot gets bonus quality
- 5+ passes: Hot Possession state

Combo breaks on turnover, foul, shot block, out-of-bounds, or delay.

### 6.3 Shooting
Supported shot types:
- Quick Shot
- Charged Shot
- Meter-enhanced Shot

Shot quality states:
- perfect strike
- strong strike
- off-balance strike
- scuffed shot
- blocked shot
- deflected shot

### 6.4 Dribbling and Tricks
MVP trick set:
- Quick Feint
- Side Cut
- Spin Turn
- Burst Touch
- Fake Shot / Fake Pass

Rules:
- tricks create lane and timing advantage
- no long invulnerability
- spam reduces effectiveness
- failed tricks create vulnerability

### 6.5 Combat
Combat actions in MVP:
- Shoulder Check
- Standing Tackle
- Slide Tackle
- Meter-assisted Heavy Hit

Possible outcomes:
- stumble
- dispossession
- knockback
- knockdown
- brutal wipeout / KO event

Anti-spam:
- whiff recovery on missed tackles
- repeated tackle usage increases vulnerability
- bad-angle tackles foul more often
- post-knockdown immunity window

### 6.6 Special Meter
Recommended: team-shared meter.

Gain sources:
- successful passes
- one-touch combos
- interceptions
- clean tackles
- trick success
- shots on target
- comeback bonus

Spend options:
- Power Tackle
- Precision Pass Buff
- Power Shot
- Recovery Burst

### 6.7 Fouls, Penalties, and Extreme Events
Foul triggers:
- tackle from behind at poor angle
- late hit after ball release
- reckless slide into planted opponent
- repeated contact during protected receive state
- illegal heavy hit in restricted zone

Severity tiers:
1. Minor foul
2. Hard foul
3. Brutal foul
4. Knockout event

Rules:
- foul in penalty area = penalty kick
- brutal foul outside area = direct free kick
- repeated team fouls can increase referee strictness

Extreme events:
- penalty kick if in denial/scoring zone
- direct free kick if outside penalty area
- short cinematic transition
- stunned state on victim

## 7. Unique Modernization Features
- Flow Chain passing bonuses
- Chaos modifiers with strict readability
- Cinematic free kicks / penalties
- Crowd Heat / Style Rank
- Lightweight character traits

## 8. Character and Team Design
The game uses fully unique player models for every player.

For 6v6:
- 12 unique characters
- no color-swap duplicates as primary identity
- each character readable by silhouette, costume, and animation feel

Example roster archetypes:
- Street Striker
- Bruiser Defender
- Nimble Playmaker
- Flash Winger
- Veteran Enforcer
- Midfield Engine
- Masked Trickster
- Power Finisher
- Acrobat
- Punk Speedster
- Elegant Captain
- Wildcard Brawler

Stat axes:
- Move Speed
- Acceleration
- Passing
- Shooting
- Ball Control
- Balance
- Tackle Power
- Discipline
- Recovery
- Style Gain

## 9. Game Feel Standards
- movement start must feel immediate
- pass contact must feel punchy and distinct per pass type
- tackles require strong impact feedback
- possession changes need explicit visual and audio confirmation
- only high-risk actions should lock the player for meaningful duration

## 10. Balance Philosophy
Guiding principle:
Fun first. Expression second. Realism third.

Desired outcomes:
- coordinated passing beats mindless aggression over time
- aggressive defense is strong but punishable
- dribbling beats impatient defenders
- meter enhances smart play
- skill matters without demanding simulation precision

## 11. Non-Goals
- realistic football simulation
- stamina-heavy realism systems
- offside in MVP
- advanced goalkeeper simulation in MVP
- full ragdoll-driven gameplay
- hero shooter ability complexity

## 12. Success Criteria
The prototype is successful when:
- new players understand the controls within one minute
- passing feels rewarding and intentional
- tackles feel impactful but fair
- goals happen frequently enough to sustain excitement
- fouls create tension instead of annoyance
- players immediately ask for another match
