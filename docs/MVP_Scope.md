> Historical note: this document still contains Unity-era planning/reference material. It is not the primary source of truth for the current web prototype unless and until it is rewritten. Prefer `README.md`, `BUILD.md`, `docs/Technical_Architecture.md`, `docs/Complete_Game_Development_Checklist.md`, `docs/web-release-checklist.md`, and `KNOWN_ISSUES.md` for current status.

# REDLINE FC — MVP Scope and Roadmap

## 1. MVP Product Definition
The MVP is a playable, polished local-multiplayer-first arcade football experience built around one excellent core loop.

## 2. Included in MVP
### Platform and mode
- PC only
- Quick Match only
- Local multiplayer: 2–4 players
- Default 4v4 format, designed to scale internally to 3v3–6v6

### Core systems
- movement
- sprint
- short pass
- driven pass
- through pass
- quick shot
- charged shot
- team-shared special meter
- shoulder check
- standing tackle
- slide tackle
- knockdown / recovery
- foul classification
- penalty kick
- direct free kick
- goal / restart loop
- flow chain pass combo system
- limited chaos modifier support

### Content
- 12 unique player characters
- 2 teams of 6 characters
- 1 arena
- 1 HUD style
- 1 ruleset
- simple front-end and match setup flow

### Technical delivery
- modular Unity project structure
- data-driven tuning via ScriptableObjects
- basic local join flow
- pause menu
- basic options menu
- playtest-friendly debug and tuning hooks

## 3. Strictly Excluded from MVP
- online multiplayer
- tournaments or season mode
- campaign or story mode
- create-a-player
- extensive customization systems
- advanced keeper simulation
- offside
- replay system
- deep commentary system
- weather system
- multiple arenas
- multiple game modes
- hero-level unique abilities per character
- cross-platform shipping

## 4. Scope Control Rules
To keep the MVP realistic:
- no more than 3 primary pass types
- no more than 3 primary tackle types
- no more than 5 trick moves
- no more than 4 spend options for meter
- no more than 1 polished arena
- no more than 1 core ruleset
- no advanced progression systems

## 5. Success Criteria
The MVP is successful if:
- players understand controls quickly
- passing feels skillful and satisfying
- tackles feel impactful but fair
- matches are readable on one shared screen
- goals, fouls, and penalties create drama without long downtime
- the game is fun enough to provoke immediate rematches

## 6. Post-MVP Roadmap
### Phase 2
- online multiplayer investigation and architecture hardening
- additional arena
- expanded roster
- more chaos modifiers
- better AI behavior
- replay system

### Phase 3
- ranked play
- cups / tournaments
- progression systems
- cosmetics
- stat tracking and match history

### Phase 4
- deeper team-building systems
- expanded traits or limited signature abilities
- couch + online hybrid support
- UGC or mod hooks if viable

## 7. Production Recommendation
The fastest path to a strong result is to over-invest in:
- pass feel
- tackle clarity
- camera readability
- set-piece pacing
- character readability

A single excellent arena and one tightly tuned mode are more valuable than broad but shallow content.
