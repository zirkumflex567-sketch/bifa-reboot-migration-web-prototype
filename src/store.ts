import { create } from 'zustand'
import { SaveManager, computeBankedResources } from './save/SaveManager'
import { MetaProgress, RunData, RunOutcome, CharacterId, defaultRunData } from './save/SaveSchema'
import { CHARACTERS, computeSkillStats } from './data/CharacterData'
import { aggregateBountyEffects, BountyRuntimeMultipliers } from './data/BountyData'
import { SHOP_ITEMS } from './data/ShopData'
import { UpgradeData, UPGRADE_POOL, rollRandomUpgrades } from './data/UpgradeData'

export type GamePhase =
  | "Loading"
  | "Hub"               // Garage hub (character select, shop, skill tree)
  | "WaitingToStart"    // Loadout confirmed, entering arena
  | "InPlay"
  | "Extraction"
  | "GameOver"
  | "RunSummary"
  | "UpgradeSelection"

export interface RunModifiers {
  speedMult: number
  damageBonus: number
  fireRateMult: number
  scrapMult: number
  techMult: number
  armor: number
  critChance: number
  critDamage: number
  pickupRadius: number
  incomingDamageMult: number
  droneCount: number
  shieldOnPickup: number
  lifesteal: number
  statusChance: number
  controlDuration: number
}

function defaultModifiers(): RunModifiers {
  return {
    speedMult: 1.0,
    damageBonus: 0,
    fireRateMult: 1.0,
    scrapMult: 1.0,
    techMult: 1.0,
    armor: 0,
    critChance: 0,
    critDamage: 0,
    pickupRadius: 0,
    incomingDamageMult: 1.0,
    droneCount: 0,
    shieldOnPickup: 0,
    lifesteal: 0,
    statusChance: 0,
    controlDuration: 0,
  }
}

export interface RunLoadout {
  character: CharacterId
  vehicleId: string
  weaponId: string
  bountyIds: string[]
}

export interface GameState {
  // Horde Survival State
  wave: number
  enemiesAlive: number
  enemiesKilledThisRun: number
  health: number
  maxHealth: number
  scrap: number         // In-run scrap
  tech: number          // In-run tech
  level: number
  xpToNextLevel: number
  phase: GamePhase
  character: CharacterId | null
  runStartMs: number
  abilityUses: number
  shield: number
  maxShield: number

  runUpgrades: Record<string, number>
  offeredUpgrades: UpgradeData[]

  // Meta / persistent (mirrored from SaveManager)
  meta: MetaProgress

  // UI
  callout: string | null
  calloutKey: number

  // Settings
  polygonMode: boolean
  audioEnabled: boolean
  volume: number

  modifiers: RunModifiers
  loadout: RunLoadout | null
  bountyMult: BountyRuntimeMultipliers

  // -------- actions --------
  showCallout: (text: string, duration?: number) => void
  setMatchState: (state: Partial<GameState>) => void
  bootFromSave: () => void
  setPhase: (phase: GamePhase) => void

  // Hub
  enterHub: () => void
  configureLoadout: (loadout: RunLoadout) => void

  // Run lifecycle
  startGame: (character: CharacterId) => void  // legacy quick-start (used by old overlay)
  startRun: () => void
  endRun: (outcome: RunOutcome) => void

  // In-run updates
  addScrapInRun: (baseAmount: number) => void
  addTechInRun: (baseAmount: number) => void
  recordKill: () => void

  // Upgrade choice (level-up)
  applyUpgrade: (id: string) => void

  // Meta
  refreshMeta: () => void
  tryBuyShop: (id: string) => boolean
  tryRankUpSkill: (char: CharacterId, nodeId: string) => boolean

  // Settings
  setPolygonMode: (enabled: boolean) => void
  setAudioEnabled: (enabled: boolean) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  wave: 1,
  enemiesAlive: 0,
  enemiesKilledThisRun: 0,
  health: 100,
  maxHealth: 100,
  scrap: 0,
  tech: 0,
  level: 1,
  xpToNextLevel: 50,
  phase: "Loading",
  character: null,
  runStartMs: 0,
  abilityUses: 3,
  shield: 0,
  maxShield: 50,

  runUpgrades: {},
  offeredUpgrades: [],

  meta: SaveManager.getMeta(),

  callout: null,
  calloutKey: 0,

  polygonMode: false,
  audioEnabled: true,
  volume: 0.5,

  modifiers: defaultModifiers(),
  loadout: null,
  bountyMult: aggregateBountyEffects([]),

  // ----- callout -----
  showCallout: (text, duration = 3000) => {
    set((state) => ({ callout: text, calloutKey: state.calloutKey + 1 }))
    setTimeout(() => {
      set((state) => (state.callout === text ? { callout: null } : state))
    }, duration)
  },

  setMatchState: (stateUpdate) => set(stateUpdate as any),
  setPhase: (phase) => set({ phase }),

  // ----- boot -----
  bootFromSave: () => {
    const save = SaveManager.getSave()
    SaveManager.markSessionStart()
    set({ meta: save.metaProgress })
  },

  refreshMeta: () => set({ meta: { ...SaveManager.getMeta() } }),

  enterHub: () => {
    set({ phase: "Hub", callout: null })
  },

  configureLoadout: (loadout) => {
    set({ loadout, character: loadout.character })
  },

  // ----- run start -----
  startRun: () => {
    const loadout = get().loadout
    if (!loadout) {
      console.warn("startRun called without loadout; falling back to rixa starter")
      get().configureLoadout({
        character: "rixa",
        vehicleId: "vehicle_schrotty",
        weaponId: "weapon_autocannon",
        bountyIds: [],
      })
    }
    applyLoadoutAndStart(set, get)
  },

  // Legacy quick-start (for old overlay path). Assembles a minimal loadout.
  startGame: (character) => {
    get().configureLoadout({
      character,
      vehicleId: "vehicle_schrotty",
      weaponId: "weapon_autocannon",
      bountyIds: [],
    })
    applyLoadoutAndStart(set, get)
  },

  // ----- run end -----
  endRun: (outcome) => {
    const state = get()
    const loadout = state.loadout
    const run: RunData = {
      ...defaultRunData(),
      dateUnixMs: Date.now(),
      durationSeconds: Math.max(0, (Date.now() - state.runStartMs) / 1000),
      wave: state.wave,
      enemiesKilled: state.enemiesKilledThisRun,
      scrapEarned: state.scrap,
      techEarned: state.tech,
      experienceEarned: state.level,
      selectedCharacterId: loadout?.character ?? state.character ?? null,
      selectedVehicleId: loadout?.vehicleId ?? null,
      selectedBountyIds: loadout?.bountyIds ?? [],
      wasExtracted: outcome === "Extracted",
      outcome,
      playerCount: 1,
    }
    SaveManager.recordRun(run)
    const banked = computeBankedResources(run)
    set({
      phase: outcome === "Died" ? "GameOver" : "RunSummary",
      meta: { ...SaveManager.getMeta() },
      // keep run stats on state for summary display
      // (scrap/tech already show earned values)
      // expose banked via callout
    })
    state.showCallout(
      outcome === "Died"
        ? `WIPED — banked ${banked.scrap} scrap, lost ${banked.techLost} tech`
        : `EXTRACTED — +${banked.scrap} scrap, +${banked.tech} tech`,
      4000,
    )
  },

  // ----- in-run currency -----
  addScrapInRun: (baseAmount) => {
    const { scrap, modifiers, bountyMult, level, xpToNextLevel } = get()
    const gained = Math.floor(baseAmount * modifiers.scrapMult * bountyMult.scrapMult)
    let newScrap = scrap + gained
    let newLevel = level
    let newXpToNext = xpToNextLevel
    let newPhase = get().phase
    let newOffered = get().offeredUpgrades

    if (newScrap >= xpToNextLevel) {
      newScrap -= xpToNextLevel
      newLevel += 1
      newXpToNext = Math.floor(xpToNextLevel * 1.5)
      newPhase = "UpgradeSelection"
      newOffered = rollRandomUpgrades(3, get().runUpgrades)
    }
    set({ scrap: newScrap, level: newLevel, xpToNextLevel: newXpToNext, phase: newPhase, offeredUpgrades: newOffered })
  },

  addTechInRun: (baseAmount) => {
    const { tech, modifiers, bountyMult } = get()
    const gained = Math.max(1, Math.floor(baseAmount * modifiers.techMult * bountyMult.techMult))
    set({ tech: tech + gained })
  },

  recordKill: () => {
    set((s) => ({ enemiesKilledThisRun: s.enemiesKilledThisRun + 1 }))
  },

  // ----- upgrade (level-up choice) -----
  applyUpgrade: (id) => set((state) => {
    const upgrade = UPGRADE_POOL.find(u => u.id === id)
    if (!upgrade) return state

    // Increment stack count
    const runUpgrades = { ...state.runUpgrades }
    runUpgrades[id] = (runUpgrades[id] || 0) + 1

    // Apply the logic mutating a draft
    const draftState = { ...state, modifiers: { ...state.modifiers }, runUpgrades, phase: "InPlay" as const, offeredUpgrades: [] as UpgradeData[] }
    upgrade.apply(draftState as any)
    
    return draftState as any
  }),

  // ----- meta economy -----
  tryBuyShop: (id) => {
    const item = SHOP_ITEMS.find(i => i.id === id)
    if (!item) return false
    if (SaveManager.isUnlocked(item.id, item.unlockType)) return false
    const ok = SaveManager.tryUnlock(item.id, item.unlockType, item.scrapCost, item.techCost)
    if (ok) set({ meta: { ...SaveManager.getMeta() } })
    return ok
  },

  tryRankUpSkill: (char, nodeId) => {
    const data = CHARACTERS[char]
    let node = null as null | (typeof data.branches[number]['nodes'][number])
    for (const b of data.branches) {
      const n = b.nodes.find(x => x.id === nodeId)
      if (n) { node = n; break }
    }
    if (!node) return false
    const current = SaveManager.getSkillRank(char, nodeId)
    if (current >= node.maxRanks) return false
    const ok = SaveManager.trySpendSkillTech(char, nodeId, node.techCost)
    if (ok) set({ meta: { ...SaveManager.getMeta() } })
    return ok
  },

  // ----- settings -----
  setPolygonMode: (enabled) => set({ polygonMode: enabled }),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
}))

// Helper: apply loadout → modifiers → start run
function applyLoadoutAndStart(
  set: (partial: Partial<GameState>) => void,
  get: () => GameState,
): void {
  const loadout = get().loadout!
  const char = CHARACTERS[loadout.character]
  const meta = SaveManager.getMeta()
  const skillRanks = meta.skillTech[loadout.character] ?? {}
  const skillStats = computeSkillStats(loadout.character, skillRanks)

  const mods = defaultModifiers()

  // character base stats
  mods.speedMult += char.baseStats.moveSpeedPercent / 100
  mods.critChance += char.baseStats.critChancePercent / 100
  mods.pickupRadius += char.baseStats.pickupRadiusPercent
  mods.armor += char.baseStats.armor

  // character-specific starter modifiers
  if (loadout.character === "rixa") {
    mods.damageBonus += 5
    mods.fireRateMult += 0.15
  } else if (loadout.character === "marek") {
    mods.scrapMult += 0.5
  }

  // skill stats (flat add per stat key)
  for (const [k, v] of Object.entries(skillStats)) {
    const key = k as keyof RunModifiers
    if (typeof v === "number" && typeof (mods as any)[key] === "number") {
      // If it's a multiplier (ends in Mult) or a percentage base stat, treat as percentage increase
      if (key.endsWith("Mult") || key === "speedMult" || key === "statusChance" || key === "critChance" || key === "lifesteal") {
        ;(mods as any)[key] += v / 100
      } else {
        // Otherwise treat as flat additive (armor, damageBonus, pickupRadius, shieldOnPickup)
        ;(mods as any)[key] += v
      }
    }
  }

  const bountyMult = aggregateBountyEffects(loadout.bountyIds)
  mods.scrapMult *= bountyMult.scrapMult
  mods.techMult *= bountyMult.techMult
  mods.damageBonus += bountyMult.damageBonus * 10 // bounty damageBonus expressed as 0.2 → +2 flat
  mods.incomingDamageMult *= bountyMult.incomingDamageMult

  const maxHealth = char.baseStats.maxHealth + (skillStats.maxHealth ?? 0)

  set({
    phase: "InPlay",
    character: loadout.character,
    modifiers: mods,
    bountyMult,
    maxHealth,
    health: maxHealth,
    scrap: 0,
    tech: 0,
    level: 1,
    xpToNextLevel: 50,
    enemiesAlive: 0,
    enemiesKilledThisRun: 0,
    wave: 1,
    runStartMs: Date.now(),
    abilityUses: 3,
    runUpgrades: {},
    offeredUpgrades: [],
  })
}
