# BIFA Implementation Guide
**Comprehensive Technical Reference**  
**Last Updated:** 2026-04-17 | **Status:** Phase 1 Complete

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Detailed Systems](#detailed-systems)
4. [Data Flow](#data-flow)
5. [Component Map](#component-map)
6. [Testing Checklist](#testing-checklist)
7. [Phase 2 Planning](#phase-2-planning)

---

## Project Overview

**BIFA** is a 2v2 Vehicle Extraction Survivor game, built as a web prototype using:
- **Frontend:** React 18 + Next.js 15 + TypeScript
- **Game Engine:** Three.js + Custom ECS-like architecture
- **State Management:** Zustand
- **Persistence:** localStorage (SaveManager)

**Current Phase:** Phase 1 (Meta-Foundations & The Garage) — COMPLETE

---

## Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────────────┐
│                  React App (Next.js)                │
├────────────────┬────────────────┬──────────────────┤
│  Hub Component │  GameEngine    │   Overlays       │
│  (UI Tabs)     │  (Three.js)    │  (RunSummary)    │
└────────┬───────┴────────┬───────┴──────────┬───────┘
         │                │                  │
         ▼                ▼                  ▼
    ┌─────────────────────────────────────────────────┐
    │        useGameStore (Zustand)                   │
    │   - gameState, meta, runState, modifiers       │
    │   - phase transitions, actions                  │
    └────────────────┬────────────────────────────────┘
                     │
    ┌────────────────▼────────────────┐
    │     SaveManager (localStorage)   │
    │   - persist/load game state      │
    │   - currency, unlocks, skills    │
    └─────────────────────────────────┘
```

### Game Loop (In-Game)

```
Loop: requestAnimationFrame()
  ├─ Input sampling (keyboard state)
  ├─ Vehicle.update(δ, input) — physics
  ├─ Weapon.update(δ, vehicle, enemies, projectiles, scene) — auto-shoot
  ├─ Projectiles.update(δ, enemies) — collision detection
  ├─ Scrap spawn queue drain + Scrap.update(δ, vehicle) — pickup
  ├─ RunController.update(δ)
  │   └─ HordeDirector.update(δ) — enemy waves
  │   └─ ExtractionZone.update(δ, vehicle) — extraction timer
  ├─ Camera update + shake decay
  ├─ Renderer.render(scene, camera)
  └─ FX Manager updates
```

### Phase State Machine

```
Loading
  ↓
Hub ←──────────────────────────────┐
  ↓ Deploy                          │
WaitingToStart                      │
  ↓                                 │
InPlay                              │
  ├─→ UpgradeSelection              │
  │      ↓ Apply                    │
  │   InPlay (resumed)              │
  │                                 │
  ├─→ RunSummary (Extracted) ──────→ (bank resources)
  │                                 │
  └─→ GameOver (Died) ──────────────→ (bank with penalty)
                                    │
                                    └─ Return to Hub
```

---

## Detailed Systems

### 1. Save System

**Purpose:** Persist game state across sessions via localStorage

**Schema** (`src/save/SaveSchema.ts`):

```ts
interface SaveGame {
  metadata: {
    version: "1.0.0"
    lastSaveTimeUnixMs: number
    totalPlaySessions: number
    gameVersion: string
  }
  metaProgress: MetaProgress
  lastRun: RunData
}

interface MetaProgress {
  totalScrap: number                    // Persistent currency
  totalTech: number                     // Persistent currency
  runsCompleted: number                 // Stat
  bestTimeSeconds: number               // Stat
  totalEnemiesKilled: number            // Stat
  unlockedWeapons: string[]             // Unlocks
  unlockedUpgrades: string[]            // Unlocks
  unlockedCosmetics: string[]           // Unused P2
  unlockedCharacters: CharacterId[]     // Default: ["rixa", "marek"]
  unlockedVehicles: string[]            // Default: ["vehicle_schrotty"]
  unlockedSpecialRewards: string[]      // P3+
  unlockedBounties: string[]            // P2
  skillTech: Record<CharacterId, Record<string, number>>  // Skill ranks
}

interface RunData {
  dateUnixMs: number
  durationSeconds: number
  wave: number
  enemiesKilled: number
  scrapEarned: number                   // In-run scrap collected
  techEarned: number                    // In-run tech collected
  experienceEarned: number              // Reserved for future
  upgradesUsed: string[]                // Upgrades applied this run
  selectedCharacterId: CharacterId | null
  selectedVehicleId: string | null
  selectedBountyIds: string[]
  specialRewardIds: string[]
  wasExtracted: boolean
  outcome: "Unknown" | "Extracted" | "Died" | "Survivor"  // Impact banking
  playerCount: number                   // For future MP
}
```

**Manager** (`src/save/SaveManager.ts`):

```ts
class SaveManager {
  // Load/persist
  load(): SaveGame
  getSave(): SaveGame
  persist(): void
  
  // Currency
  addScrap(amount: number): void
  addTech(amount: number): void
  trySpend(scrapCost: number, techCost: number): boolean
  
  // Unlocks
  isUnlocked(id: string, type: UnlockType): boolean
  tryUnlock(id: string, type: UnlockType, scrapCost, techCost): boolean
  
  // Skill tree
  getSkillRank(char: CharacterId, nodeId: string): number
  trySpendSkillTech(char: CharacterId, nodeId: string, techCost): boolean
  
  // Run banking (outcome-based)
  recordRun(run: RunData): void
  
  // Lifecycle
  markSessionStart(): void
  resetAll(): void
}
```

**Banking Logic** (in recordRun):

```ts
const outcome = run.outcome
if (outcome === "Extracted" || outcome === "Survivor") {
  meta.totalScrap += run.scrapEarned        // Full reward
  meta.totalTech += run.techEarned
} else if (outcome === "Died") {
  meta.totalScrap += Math.floor(run.scrapEarned * 0.5)  // 50% penalty (per GDD)
  // Tech is lost (not banked)
}
```

---

### 2. Hub UI System

**Location:** `app/components/Hub.tsx`

**Purpose:** Persistent garage where players configure runs and upgrade their character

**Structure:**

```tsx
<Hub> (only renders when phase === "Hub")
  ├─ MetaProgress Header (Scrap / Tech / Runs)
  ├─ Tab Navigation (Pilot / Shop / Contracts / Tech-Lab)
  ├─ Tab Content
  │   ├─ PilotTab
  │   │   ├─ Character Selection (Rixa / Marek)
  │   │   ├─ Character Profile (lore, stats)
  │   │   ├─ Vehicle Selection (from unlockedVehicles)
  │   │   └─ Weapon Selection (from unlockedWeapons)
  │   ├─ ShopTab
  │   │   └─ Item Cards (grouped by category)
  │   │       ├─ Display Name
  │   │       ├─ Description
  │   │       ├─ Cost (Scrap + Tech)
  │   │       ├─ Owned/Locked Badge
  │   │       └─ Buy Button (disabled if unaffordable)
  │   ├─ ContractsTab
  │   │   └─ Bounty Toggle (0-2 selected)
  │   └─ TechLabTab
  │       ├─ Character Select
  │       └─ Skill Tree Nodes
  │           ├─ Node Name
  │           ├─ Current Rank
  │           ├─ Tech Cost
  │           └─ Rank Up Button
  └─ Deploy Footer
      ├─ Loadout Summary (Pilot / Vehicle / Weapon / Contracts)
      └─ DEPLOY Button (disabled if missing unlocks)
```

---

### 3. Loadout System

**Purpose:** Player's selected configuration for a run

**Data Structure:**

```ts
interface RunLoadout {
  character: CharacterId      // "rixa" | "marek"
  vehicleId: string           // e.g., "vehicle_schrotty"
  weaponId: string            // e.g., "weapon_autocannon"
  bountyIds: string[]         // 0-2 bounty IDs
}
```

**Flow:**
1. Player customizes in Hub
2. Clicks DEPLOY
3. `configureLoadout(loadout)` saves to store
4. `startRun()` enters InPlay
5. Vehicle/Weapon/Character initialized with loadout

---

### 4. In-Run Game State

**Key Store Fields:**

```ts
interface GameState {
  // Horde Survival
  wave: number
  enemiesAlive: number
  enemiesKilledThisRun: number
  health: number
  maxHealth: number
  scrap: number               // In-run scrap (collected, not banked)
  tech: number                // In-run tech (collected, not banked)
  level: number               // Current run level
  xpToNextLevel: number       // XP threshold
  
  // Progression
  phase: GamePhase            // Current state
  character: CharacterId | null
  runStartMs: number          // For duration tracking
  abilityUses: number         // Charges remaining
  shield: number              // Temporary shield
  maxShield: number
  
  // Upgrades
  runUpgrades: Record<string, number>    // Upgrades applied this run
  offeredUpgrades: UpgradeData[]         // Level-up choices
  
  // Meta (synced from SaveManager)
  meta: MetaProgress
  
  // Modifiers (calculated from character + bounties + upgrades)
  modifiers: RunModifiers
}

interface RunModifiers {
  speedMult: number
  damageBonus: number
  fireRateMult: number
  scrapMult: number
  techMult: number
  armor: number
  // ... etc
}
```

---

### 5. Character Modifiers System

**Base Modifiers per Character:**

| Stat | Rixa | Marek |
|------|------|-------|
| damageBonus | +5 | 0 |
| fireRateMult | ×1.15 | ×1.0 |
| maxHealth | 100 | 150 |
| scrapMult | ×1.0 | ×1.5 |

**Applied on:**
- `startRun()` — character selection → modifiers initialized
- `applyUpgrade()` — level-up choice → modifiers updated
- `aggregateBountyEffects()` — bounty selection → additional mods

---

### 6. Run Summary System

**Location:** `app/components/Overlays.tsx` (lines 60–100)

**Purpose:** Display end-of-run results and banking

**Screens:**

**RunSummary Screen** (Extracted):
```
EXTRACTION SUCCESS
├─ Pilot, Wave, Level, Kills, Duration
├─ Scrap Earned / Tech Earned
└─ Scrap Banked (+X) / Tech Banked (+Y)  [green]
  [RETURN TO GARAGE button]
```

**GameOver Screen** (Died):
```
VEHICLE DESTROYED
├─ Pilot, Wave, Level, Kills, Duration
├─ Scrap Earned / Tech Earned
├─ Scrap Banked (+X, 50% penalty) / Tech Banked (+0, lost)  [red]
└─ Scrap Lost (-X) / Tech Lost (-Y)  [red]
  [RETURN TO GARAGE button]
```

**Banking Calculation:**

```ts
function computeBankedResources(run: RunData) {
  const outcome = run.outcome
  if (outcome === "Extracted" || outcome === "Survivor") {
    return {
      scrap: run.scrapEarned,
      tech: run.techEarned,
      scrapLost: 0,
      techLost: 0,
    }
  } else if (outcome === "Died") {
    const scrapKept = Math.floor(run.scrapEarned * 0.5)
    const scrapLost = run.scrapEarned - scrapKept
    return {
      scrap: scrapKept,
      tech: 0,
      scrapLost: scrapLost,
      techLost: run.techEarned,
    }
  }
}
```

---

## Data Flow

### New Game Start

```
1. User loads http://localhost:3000
2. React mounts → Game.start() called
3. Game.start():
   - AssetManager.preloadAll() (3D models, audio)
   - initGameplay() (Scene, Entities, Camera)
   - useGameStore.bootFromSave() → SaveManager.load()
   - useGameStore.enterHub() → phase = "Hub"
4. Hub component renders (Tab UI visible)
5. Save state = default save (0 Scrap, 0 Tech)
```

### Deploy Run

```
1. User clicks DEPLOY in Hub
2. configureLoadout(loadout) → store.loadout = loadout
3. startRun() → phase = "InPlay"
4. Game.resetArena() → Clears previous state
5. Vehicle spawned at (0,0,0)
6. HordeDirector begins wave 1
7. Loop starts: Input → Vehicle → Weapon → Projectiles → Scrap → HordeDirector → ExtractionZone → Render
```

### End of Run (Extraction)

```
1. ExtractionZone.triggerExtraction() triggered
   (vehicle in zone ≥ 3.0 seconds)
2. phase = "RunSummary"
3. Overlays component shows RunSummary screen
4. User clicks "RETURN TO GARAGE"
5. SaveManager.recordRun(run) called → resources banked
6. phase = "Hub" → Hub renders again
7. Meta state updated (totalScrap, totalTech)
```

### End of Run (Death)

```
1. HordeDirector.dealDamageToVehicle() → health ≤ 0
2. phase = "GameOver"
3. Overlays component shows GameOver screen
4. User clicks "RETURN TO GARAGE"
5. SaveManager.recordRun(run) called → 50% scrap banked, tech lost
6. phase = "Hub"
7. Meta state updated
```

---

## Component Map

```
App Hierarchy
├── Game Engine (Three.js)
│   ├── Scene
│   │   ├── World (Arena floor, lights)
│   │   ├── Vehicle
│   │   ├── Enemies[] (Horde)
│   │   ├── Projectiles[]
│   │   ├── Scrap[]
│   │   ├── ExtractionZone
│   │   └── FX (Particles, etc)
│   └── Renderer (WebGL)
│
└── React Components
    ├── GameEngine (Three.js wrapper)
    ├── GameUI (HUD during play)
    ├── Hub (Meta UI)
    │   ├── PilotTab
    │   ├── ShopTab
    │   ├── ContractsTab
    │   └── TechLabTab
    └── Overlays
        ├── LoadingOverlay
        ├── WaitingToStartOverlay
        ├── UpgradeSelectionOverlay
        ├── RunSummaryOverlay
        └── GameOverOverlay
```

---

## Testing Checklist

### Playthrough Test

- [ ] Load game → Hub loads with 0 Scrap/Tech
- [ ] Select character (Rixa or Marek)
- [ ] Select vehicle (vehicle_schrotty unlocked by default)
- [ ] Select weapon (weapon_autocannon unlocked by default)
- [ ] Click DEPLOY → Game starts
- [ ] Play for 1+ waves
- [ ] Either extract or die
- [ ] See run summary with banked resources
- [ ] Return to Hub → Scrap/Tech increased

### Save Persistence Test

- [ ] Complete 2-3 runs
- [ ] Reload page (Ctrl+R)
- [ ] Verify Scrap/Tech persists
- [ ] Verify run count increased

### Shop Test

- [ ] Have ≥ 100 Scrap
- [ ] Go to Shop tab
- [ ] Find affordable item
- [ ] Click Buy
- [ ] Return to Pilot tab
- [ ] Verify item now available for selection

### Skill Tree Test

- [ ] Have ≥ 50 Tech
- [ ] Go to Tech-Lab tab
- [ ] Click Rank Up on available node
- [ ] Verify rank increased, Tech deducted

---

## Phase 2 Planning

**Phase 2: Character Depth & Skill Trees (P0.5)**

### Features to Add

1. **Skill Tree UI Enhancement**
   - Visual branching diagram (3 branches per character)
   - Tier system (Tier 1/2/3 + Capstone)
   - Unlock requirements (must rank T1 before T2)

2. **Trait Implementation**
   - Rixa: Chromrausch (stacking damage buff from status effects)
   - Marek: Schrottkern (pickups generate temporary shields)

3. **Bounty System**
   - Pre-run contract selection (modify run difficulty)
   - Bounty effects (e.g., "+50% Scrap but 2x Enemy HP")
   - Bounty rewards (bonus tech)

4. **Skill Node Data Structure**
   ```ts
   interface SkillNode {
     id: string
     name: string
     description: string
     tier: 1 | 2 | 3 | "Capstone"
     branch: "A" | "B" | "C"
     tierUnlockThreshold: number  // e.g., "unlock T2 if 5+ T1 ranks"
     costPerRank: number[]         // Scaling cost
     valuePerRank: number
     hardcap: number
   }
   ```

---

## Conclusion

**Phase 1 Implementation Status: COMPLETE**

All core persistent systems (Save, Shop, Loadout, Run Banking) are functional and integrated. The game loop cleanly separates in-run state from meta-progression.

**Recommended Next Steps:**

1. **Session:** Full playthrough test (3+ runs, verify save persistence)
2. **Session:** Shop/Skill Tree iteration (UX polish)
3. **Design Review:** Confirm Phase 2 feature scope (Trait effects, Bounty balance)
4. **Implementation:** Phase 2 (Character Depth & Skill Trees)

---

## File Reference

| System | Primary Files |
|--------|--------------|
| Save | src/save/SaveManager.ts, SaveSchema.ts |
| Hub UI | app/components/Hub.tsx |
| Game Loop | src/game/Game.ts |
| Game State | src/store.ts |
| Run End | app/components/Overlays.tsx |
| Data | src/data/CharacterData.ts, ShopData.ts, UpgradeData.ts |

