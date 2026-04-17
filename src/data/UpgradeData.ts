import { GameState } from "../store"

export type UpgradeRarity = "Common" | "Rare" | "Epic" | "Legendary"

export interface UpgradeData {
  id: string
  name: string
  description: string
  rarity: UpgradeRarity
  maxStacks: number
  apply: (state: GameState) => void
}

export const UPGRADE_POOL: UpgradeData[] = [
  {
    id: "upg_armor",
    name: "Hull Reinforcement",
    description: "+50 Max Hull. Heals for 50.",
    rarity: "Common",
    maxStacks: 10,
    apply: (state) => {
      state.maxHealth += 50
      state.health = Math.min(state.health + 50, state.maxHealth)
    }
  },
  {
    id: "upg_turbo",
    name: "Turbo Dash",
    description: "+10% Move Speed.",
    rarity: "Rare",
    maxStacks: 5,
    apply: (state) => {
      state.modifiers.speedMult += 0.1
    }
  },
  {
    id: "upg_cannons",
    name: "Autocannon Overclock",
    description: "+20% Fire Rate, +5 Damage.",
    rarity: "Common",
    maxStacks: 10,
    apply: (state) => {
      state.modifiers.fireRateMult += 0.2
      state.modifiers.damageBonus += 5
    }
  },
  {
    id: "upg_scrap_magnet",
    name: "Magnetic Field",
    description: "+20% Pickup Radius.",
    rarity: "Common",
    maxStacks: 5,
    apply: (state) => {
      state.modifiers.pickupRadius += 0.2
    }
  },
  {
    id: "upg_crit_focus",
    name: "Lethal Precision",
    description: "+10% Crit Chance.",
    rarity: "Epic",
    maxStacks: 5,
    apply: (state) => {
      state.modifiers.critChance += 0.1
    }
  }
]

export function rollRandomUpgrades(count: number, currentUpgrades: Record<string, number>): UpgradeData[] {
  // Filter out max stacked upgrades
  const available = UPGRADE_POOL.filter(u => (currentUpgrades[u.id] || 0) < u.maxStacks)
  
  // Shuffle basic (no weights for now to keep it simple)
  const shuffled = [...available].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
