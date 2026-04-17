# REDLINE FC Web — Known Issues

## Gameplay
1. **Set-piece control restrictions not enforced** — During corner/goal kicks/throw-ins, non-kicking players are not yet locked into a controlled restart flow.
2. **Tackle legality classifier is still shallow** — Foul severity, angle, and timing rules need deeper differentiation.
3. **Penalty kick flow missing** — Fouls in the penalty area are not yet routed into a dedicated penalty sequence.
4. **Overtime/sudden death not fully validated end-to-end** — Core match flow exists, but full scenario verification is still pending.
5. **Character/team selection is partially wired** — Captain selection now updates the setup-screen lineup preview and affects team lineup order plus archetype-driven player stats/colors, but there is not yet a full draft/setup flow for all roster slots.

## Visual / UI
6. **Pause UX is minimal** — Pause/resume exists, but currently relies on callouts instead of a dedicated pause overlay/menu.
7. **Production HUD pass is incomplete** — The current HUD is functional but still prototype-grade.
8. **Cross-browser / mobile validation is still outstanding** — Layout and feel have not yet been fully checked across target environments.

## Architecture
9. **`game.html` remains a large legacy surface** — The modular TypeScript path is the intended future direction, but this file is still large and should be reduced or formally retired.
10. **Automated tests are still very light** — Core match tests exist, but broader gameplay/system coverage is still missing.

## Performance
11. **No formal performance baseline captured yet** — Build works, but FPS/frame-spike profiling has not been documented in this pass.

## Post-MVP (Do Not Fix Now)
- Online multiplayer
- Additional arenas
- Replay system
- Ranked/progression

## Triage (2026-04-17)
- P0 next sprint: Set-piece restrictions, penalty flow.
- P1 next sprint: Pause/full-time UX consistency polish, production HUD pass.
- P2 backlog: Desktop/mobile matrix validation, performance baseline capture.
