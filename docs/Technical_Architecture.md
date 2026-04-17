# REDLINE FC — Technical Architecture (Web Prototype)

## 1. Technical goals
This architecture is designed for:
- fast browser-based gameplay iteration
- modular TypeScript gameplay code
- low-friction local prototyping
- clear separation between game state, rendering, input, and HUD
- future extensibility without locking the project into a heavyweight editor workflow

Core engineering principles:
- small modules over monoliths
- deterministic gameplay state where practical
- explicit state machines for match flow
- HTML/CSS for HUD and menus
- Three.js for 3D presentation
- Vitest for lightweight unit testing

## 2. Stack
- TypeScript
- Vite
- Three.js
- Vitest
- ESLint
- Prettier

## 3. Project structure
```text
.
├── index.html              # browser shell + HUD mount points
├── game.html               # large standalone gameplay page / legacy surface
├── public/                 # static assets
├── src/
│   ├── audio/              # sound helpers
│   ├── config/             # gameplay constants and archetypes
│   ├── game/               # core gameplay modules
│   │   ├── AI.ts
│   │   ├── Ball.ts
│   │   ├── Combat.ts
│   │   ├── Game.ts
│   │   ├── HUD.ts
│   │   ├── Input.ts
│   │   ├── Match.ts
│   │   ├── Match.test.ts
│   │   ├── Player.ts
│   │   └── World.ts
│   ├── input/              # alternate/shared input helpers
│   ├── match/              # shared match enums/types
│   ├── main.ts             # app bootstrap
│   └── style.css           # UI styling
├── BUILD.md
├── KNOWN_ISSUES.md
├── package.json
└── vite.config.ts
```

## 4. Runtime module responsibilities

### 4.1 Game module
`src/game/Game.ts`
- owns the main loop
- advances match state
- coordinates players, ball, AI, HUD, and camera
- reacts to match events like halftime, full-time, restart, pause/resume

### 4.2 Match module
`src/game/Match.ts`
- source of truth for match phase
- tracks score, clock, half, and pause state
- emits events consumed by the game orchestrator

### 4.3 Player module
`src/game/Player.ts`
- stores player runtime state
- handles locomotion/action data
- exposes state used by game orchestration and HUD

### 4.4 Ball module
`src/game/Ball.ts`
- owns ball state and movement
- tracks possession / goal state
- supports pass and shot release behavior

### 4.5 Combat module
`src/game/Combat.ts`
- resolves tackle/collision interactions
- reports foul-like outcomes back to the game loop

### 4.6 AI module
`src/game/AI.ts`
- drives non-human players
- makes possession and off-ball decisions

### 4.7 HUD module
`src/game/HUD.ts`
- updates DOM-based score/timer/possession/callouts
- manages overlays and stamina indicators

### 4.8 Input module
`src/game/Input.ts`
- tracks keyboard state
- exposes held/pressed semantics to the game loop
- maps bindings for local 1P / 2P play

## 5. Architectural notes
- The modular TypeScript path is the intended future direction.
- `game.html` still exists as a large standalone surface and should be considered technical debt until fully replaced or intentionally retained.
- Gameplay rules should continue moving into testable modules first, with rendering kept as a thin consumer of state.
- Browser/HUD UX should stay in HTML/CSS unless there is a clear reason to move UI into a canvas-only layer.

## 6. Quality gates
Expected local validation commands:
```bash
npm install
npm run lint
npm run test
npm run build
```

Release validation lives in:
- `docs/web-release-checklist.md`
- `docs/Complete_Game_Development_Checklist.md`
- `KNOWN_ISSUES.md`
