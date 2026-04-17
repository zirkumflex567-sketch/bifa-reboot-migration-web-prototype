# REDLINE FC Web - Known Issues

## Gameplay
1. **Set-piece control restrictions not enforced** - During corner/goal kicks/throw-ins, non-kicking players are not yet locked into a controlled restart flow.
2. **Penalty sequence is still prototype-grade** - Fouls in the penalty area now route into an automatic penalty-goal outcome, but a dedicated player-controlled penalty shoot sequence is still missing.
3. **Set-piece variants still incomplete** - Corner/throw-in specific restart mechanics are not yet fully modeled.
4. **Character/team selection is partially wired** - Captain selection updates lineup preview and archetype-driven stats/colors, but there is not yet a full draft/setup flow for all roster slots.

## Visual / UI
5. **Pause UX is minimal** - Pause/resume exists with overlay/menu controls, but still needs production polish and richer options flow.
6. **Production HUD pass is incomplete** - The current HUD is functional but still prototype-grade.
7. **Cross-browser / mobile validation is still outstanding** - Layout and feel have baseline validation but still need full matrix execution across target environments.

## Architecture
8. **`game.html` remains a large legacy surface** - The modular TypeScript path is the intended future direction, but this file is still large and should be reduced or formally retired.
9. **Automated tests are still very light** - Core match tests exist, but broader gameplay/system coverage is still missing.

## Performance
10. **No formal in-match FPS profile captured yet** - Build works, but frame-spike profiling during active play remains pending.

## Post-MVP (Do Not Fix Now)
- Online multiplayer
- Additional arenas
- Replay system
- Ranked/progression

## Triage (2026-04-17)
- P0 next sprint: Full set-piece restrictions, dedicated player-controlled penalty sequence.
- P1 next sprint: Pause/full-time UX consistency polish, production HUD pass.
- P2 backlog: Desktop/mobile matrix completion, in-match performance profiling pass.
