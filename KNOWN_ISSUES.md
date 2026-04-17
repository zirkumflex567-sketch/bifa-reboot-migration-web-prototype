# REDLINE FC Web — Known Issues

## Gameplay
1. **Set-piece control restrictions not enforced** — During corner/goal kicks/throw-ins, all players can still move freely. The RestartDirector should lock non-kicking players in place until the ball is played.
2. **Tackle legality classifier incomplete** — All tackles are treated equally; no angle/timing/context-based foul severity tiers yet.
3. **Penalty kick flow missing** — Fouls in the penalty area trigger a free kick, not a penalty.
4. **Overtime/sudden death not fully tested** — The OT logic exists but hasn't been verified end-to-end.

## Visual / UI
5. **Team Select character selection doesn't affect gameplay** — Clicking a character card selects it visually, but the actual player assignment in `buildTeams()` still uses round-robin archetype assignment. Wiring `tsSelectedA/B` into player creation is needed.
6. **Polygon Mode assets may not load** — FBX paths in `POLYGON_CHAR_PATHS` point to `/assets/characters/` which may not exist. Falls back to procedural capsules gracefully.
7. **targetRing property may not exist on all players** — The teammate arrow code references `tm.targetRing` which must exist in `createCharacter()`. If missing, will throw a silent error.

## Performance
8. **Remaining per-frame allocations** — `ball.position.clone()` still used in particle emitters and some combat code (~10 allocations/frame). Not critical at 60fps but should be cleaned up.
9. **Particle pool fixed at 500** — Could be reduced for weak devices.

## Architecture
10. **game.html is 2700+ lines** — TypeScript modules are extracted but not yet imported by game.html. The monolith still runs standalone.
11. **No automated tests** — Vitest is available but no test files exist yet.

## Post-MVP (Do Not Fix Now)
- Online multiplayer
- Additional arenas
- Replay system
- Ranked/progression
