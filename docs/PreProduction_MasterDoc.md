> Historical note: this document still contains Unity-era planning/reference material. It is not the primary source of truth for the current web prototype unless and until it is rewritten. Prefer `README.md`, `BUILD.md`, `docs/Technical_Architecture.md`, `docs/Complete_Game_Development_Checklist.md`, `docs/web-release-checklist.md`, and `KNOWN_ISSUES.md` for current status.

# REDLINE FC — Pre-Production Master Document

## 1. Project Overview
### Working Title
REDLINE FC

### Genre
Arcade Football + Combat Hybrid

### Target Platform
- PC

### Core Target for MVP
- Local multiplayer
- 2–4 human players
- Quick Match only
- Small teams
- High readability
- High replayability

### Vision Statement
REDLINE FC is a fast, chaotic, skill-based football game where passing, positioning, and trick play are as important as aggressive tackles and combat mechanics. It is not a simulation and not a pure fighting game. It is a modern arcade sports brawler with strong player expression and high couch-competitive energy.

## 2. Creative Direction
### Emotional Goals
The game should feel:
- fast
- loud
- physical
- skillful
- readable
- immediately replayable

### Design Promise
Players must be able to express mastery through:
- passing lane creation
- one-touch combinations
- defensive reads
- tackle timing
- risk-managed aggression
- clutch finishing

### Non-Goals
- realistic football simulation
- complex tactical management
- simulation-grade referee logic
- realistic stamina simulation
- deep progression in MVP
- hero shooter style ability overload

## 3. Gameplay Pillars
### 3.1 Smart football first
The core loop is built around movement, passing, positioning, and shot creation.

### 3.2 Violence with structure
Combat is a tactical disruption layer. It must never reduce the match to random collision spam.

### 3.3 Constant decision density
Players should always have a meaningful next action: move, receive, pass, cut, tackle, intercept, shoot, or spend meter.

### 3.4 Readable chaos
The game may become explosive, but the reason for every major event must stay legible.

### 3.5 Local clarity first
All systems are built around one shared screen and fast, low-friction controller play.

## 4. Core Match Structure
### Default Match Setup
- 4v4 recommended default
- internal support path for 3v3–6v6
- 2 halves x 3 minutes
- optional sudden death overtime
- one arena in MVP

### Match Loop
1. Kickoff
2. Possession contest
3. Build-up through passing and movement
4. Tackle/interception pressure
5. Shot attempt or turnover
6. Restart or goal sequence
7. Repeat

### Restarts
- kickoff
- sideline quick restart
- goal kick
- corner
- free kick
- penalty kick

## 5. Controls Philosophy
Controls must be readable for new players and deep for experienced players.

### Core Input Intent
- one stick for move
- one action family for passing
- one action family for shooting
- one action family for tackling
- one action family for tricks
- one special input family for meter usage

### Design Rule
No essential mechanic should require extreme input complexity in MVP.

## 6. Football Systems
### 6.1 Movement
Movement targets:
- strong first-step response
- fast transitions between states
- readable facing
- manageable sprint commitment
- vulnerable ball turns

State set:
- idle
- jog
- sprint
- face-up defense
- possession movement
- trick state
- pass state
- shot state
- tackle state
- stunned
- knocked down
- recovery

### 6.2 Passing
Passing is the most important system in the game.

#### Pass set
- short pass
- driven pass
- through pass

#### Design targets
- intentional aiming
- readable assist
- receiver skill interaction
- lane interception logic
- rewarding one-touch flow

#### Input rules
- tap = short pass
- hold = driven pass
- modifier + pass = through pass

#### Resolution factors
- facing alignment
- distance
- pass type
- pressure
- lane occupation
- receiver readiness
- release stability
- pass stat

#### Outcome quality
- perfect
- good
- rushed
- broken

#### Receiver results
- clean trap
- heavy touch
- bobble
- deflection
- loose ball

### 6.3 Shooting
Supported shot set:
- snap shot
- charged shot
- special meter shot

Shot variables:
- angle
- range
- pressure
- timing
- combo state
- body orientation
- shooting stat

### 6.4 Dribbling and Tricks
MVP trick family:
- feint
- cut
- spin
- burst touch
- fake shot/pass

Purpose:
- create lane
- bait tackle
- improve pass or shot setup

Anti-abuse rules:
- no long invulnerability
- repeated spam loses value
- failure creates turnover risk

## 7. Combat System
### Combat Actions
- shoulder check
- standing tackle
- slide tackle
- meter heavy hit

### Resolution Inputs
- angle
- timing
- velocity
- ball state
- defender discipline
- target balance

### Results
- stumble
- dispossession
- knockback
- knockdown
- brutal wipeout

### Anti-Spam
- missed tackle recovery
- repeated attempt fatigue tuning
- poor-angle foul increase
- wake-up protection window

## 8. Special Meter
### Design Purpose
Special meter adds drama, comeback energy, and highlight moments without replacing skill.

### Recommended Model
- team-shared meter
- 3 segments max

### Gain Sources
- successful passes
- one-touch combos
- interceptions
- clean tackles
- shots on target
- trick success
- comeback pressure bonus

### Spend Options
- power tackle
- precision pass buff
- power shot
- recovery burst

## 9. Fouls and Extreme Events
### Foul Rules
Trigger examples:
- late hit
- poor-angle tackle from behind
- reckless slide into planted target
- repeated heavy contact in protected receive state
- illegal special hit in restricted zone

### Severity
1. minor
2. hard
3. brutal
4. knockout event

### Outcomes
- free kick
- penalty kick
- hard stop
- short cinematic event
- temporary stun state

## 10. Modernization Features
### Flow Chain
Passing combo system that rewards sustained possession and good football choices.

### Chaos Modifiers
Limited match modifiers that temporarily alter match texture while preserving readability.

### Cinematic Set Pieces
Short, controlled presentation for penalties and free kicks.

### Crowd Heat
Style-driven feedback and momentum escalation based on entertaining or skillful play.

### Character Traits
Each character has a signature edge, but not a fully unique hero kit.

## 11. Character Design
### Core Requirement
Every player model should be visually unique.

### 6v6 Roster Requirement
- 12 unique characters
- no primary reliance on color-swap duplicates
- silhouette and motion readability from gameplay camera

### Archetype Set
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

### Character Stats
- move speed
- acceleration
- passing
- shooting
- ball control
- balance
- tackle power
- discipline
- recovery
- style gain

## 12. Art Direction Strategy
Because prototype characters may come from mixed free sources, the game should unify them through:
- common material strategy
- shared post-processing
- team color accent systems
- shared FX language
- scale normalization
- shared animation retargeting approach

## 13. Technical Direction Summary
### Engine and Core Packages
- Unity 6 or production-stable LTS equivalent
- URP
- New Input System
- Cinemachine
- Addressables
- TextMeshPro

### Engineering Principles
- SOLID
- modular systems
- command-based input
- state-driven player logic
- data-driven tuning
- minimal hard references

### Runtime Modules
- Match
- Team
- Player
- Ball
- Combat
- Rules/Referee
- Camera
- HUD

## 14. MVP Scope
### Included
- PC
- local multiplayer 2–4
- Quick Match
- one arena
- one ruleset
- 12 unique characters
- 2 teams
- movement, passing, shooting, tricks, tackles, meter, fouls, penalties

### Excluded
- online multiplayer
- progression
- tournament mode
- advanced keeper simulation
- replay system
- offside
- deep customization
- multiple arenas

## 15. Post-MVP Roadmap
- online multiplayer architecture
- additional arenas
- larger roster
- more chaos modifiers
- expanded traits and polish systems
- replays and stat tracking

## 16. AI Workflow Integration
### Codex
Use for code scaffolding, tests, refactors, interfaces, ScriptableObjects, and gameplay service skeletons.

### MCP for Unity
Use for scene creation, prefab wiring, spawn generation, validation passes, and bulk editor actions.

### Coplay MCP
Use for planning, task decomposition, audit against design, bug triage, and playtest checklist generation.

## 17. Production Success Criteria
The project is on track when:
- passing feels intentional and satisfying
- combat is impactful but fair
- camera readability remains strong in 4-player local sessions
- restarts are fast
- characters are readable
- players want immediate rematches

## 18. Open Research Items
The following require live verification outside this session before final production approval:
- current free character asset availability
- current Mixamo terms
- current Unity Asset Store free listing availability
- current Sketchfab commercial-use-safe options
- any third-party license changes
