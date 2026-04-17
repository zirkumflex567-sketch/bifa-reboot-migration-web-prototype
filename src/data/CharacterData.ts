import { CharacterId } from "../save/SaveSchema"

export interface CharacterBaseStats {
  maxHealth: number
  armor: number
  moveSpeedPercent: number
  critChancePercent: number
  pickupRadiusPercent: number
}

export interface CharacterTrait {
  id: string
  name: string
  description: string
}

export interface SkillNode {
  id: string
  tier: 1 | 2 | 3 | 4 // 4 = capstone
  name: string
  description: string
  maxRanks: number
  techCost: number
  valuePerRank: number
  isPercent: boolean
  statKey: StatKey
}

export type StatKey =
  | "damageBonus"
  | "fireRateMult"
  | "speedMult"
  | "scrapMult"
  | "techMult"
  | "maxHealth"
  | "armor"
  | "critChance"
  | "critDamage"
  | "pickupRadius"
  | "statusChance"
  | "controlDuration"
  | "lifesteal"
  | "droneCount"
  | "shieldOnPickup"

export interface SkillBranch {
  id: string
  name: string
  theme: string
  nodes: SkillNode[] // includes capstone as last entry (tier 4)
}

export interface CharacterData {
  id: CharacterId
  displayName: string
  title: string
  description: string
  shortLore: string
  baseStats: CharacterBaseStats
  passiveTrait: CharacterTrait
  branches: [SkillBranch, SkillBranch, SkillBranch] // exactly 3
}

// ---------------------------------------------------------------------------
// RIXA "Chromlilie" Voss — Glass Cannon / Alchemist
// ---------------------------------------------------------------------------

const RIXA: CharacterData = {
  id: "rixa",
  displayName: "Rixa",
  title: "Chromlilie Voss",
  description: "Glass cannon pilot. Status-effect alchemist. Every affliction fuels her damage.",
  shortLore: "Once a back-alley chemist, Rixa turned her addiction to volatile compounds into a battlefield art form.",
  baseStats: {
    maxHealth: 100,
    armor: 0,
    moveSpeedPercent: 5,
    critChancePercent: 5,
    pickupRadiusPercent: 0,
  },
  passiveTrait: {
    id: "chromrausch",
    name: "Chromrausch",
    description: "+3% damage per active status effect on nearby enemies (max 10 stacks, 3s duration).",
  },
  branches: [
    {
      id: "chrom_alchemie",
      name: "Chrom-Alchemie",
      theme: "Burst damage & explosion chains",
      nodes: [
        { id: "ca_1", tier: 1, name: "Volatile Brew", description: "+X% damage to enemies afflicted with any status.", maxRanks: 5, techCost: 1, valuePerRank: 4, isPercent: true, statKey: "damageBonus" },
        { id: "ca_2", tier: 2, name: "Chain Fission", description: "+X% status proc chance.", maxRanks: 5, techCost: 2, valuePerRank: 3, isPercent: true, statKey: "statusChance" },
        { id: "ca_3", tier: 3, name: "Alchemic Surge", description: "+X% crit damage.", maxRanks: 3, techCost: 3, valuePerRank: 10, isPercent: true, statKey: "critDamage" },
        { id: "ca_cap", tier: 4, name: "CAPSTONE: Detonator", description: "Killing a status-afflicted enemy triggers an AoE explosion. +20% damage overall.", maxRanks: 1, techCost: 5, valuePerRank: 20, isPercent: true, statKey: "damageBonus" },
      ],
    },
    {
      id: "secco_chaos",
      name: "Secco & Chaos",
      theme: "Crowd control",
      nodes: [
        { id: "sc_1", tier: 1, name: "Charm Vial", description: "+X% control duration.", maxRanks: 5, techCost: 1, valuePerRank: 8, isPercent: true, statKey: "controlDuration" },
        { id: "sc_2", tier: 2, name: "Confuse Mist", description: "+X% status proc chance (stacks with Chain Fission).", maxRanks: 5, techCost: 2, valuePerRank: 2, isPercent: true, statKey: "statusChance" },
        { id: "sc_3", tier: 3, name: "Mass Hysteria", description: "+X% fire rate while any enemy is controlled.", maxRanks: 3, techCost: 3, valuePerRank: 5, isPercent: true, statKey: "fireRateMult" },
        { id: "sc_cap", tier: 4, name: "CAPSTONE: Pandemonium", description: "Controlled enemies damage each other. +30% control duration.", maxRanks: 1, techCost: 5, valuePerRank: 30, isPercent: true, statKey: "controlDuration" },
      ],
    },
    {
      id: "herzbrecherin",
      name: "Herzbrecherin",
      theme: "Lifesteal & survivability",
      nodes: [
        { id: "hb_1", tier: 1, name: "Bloodletting", description: "+X% lifesteal on debuffed targets.", maxRanks: 5, techCost: 1, valuePerRank: 2, isPercent: true, statKey: "lifesteal" },
        { id: "hb_2", tier: 2, name: "Iron Roses", description: "+X max health.", maxRanks: 5, techCost: 2, valuePerRank: 10, isPercent: false, statKey: "maxHealth" },
        { id: "hb_3", tier: 3, name: "Parasite's Grace", description: "+X% pickup radius.", maxRanks: 3, techCost: 3, valuePerRank: 15, isPercent: true, statKey: "pickupRadius" },
        { id: "hb_cap", tier: 4, name: "CAPSTONE: Vitality Siphon", description: "Kills heal for 5% max HP. +10% lifesteal overall.", maxRanks: 1, techCost: 5, valuePerRank: 10, isPercent: true, statKey: "lifesteal" },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// MAREK "Schrottanker" Graul — Tank / Engineer
// ---------------------------------------------------------------------------

const MAREK: CharacterData = {
  id: "marek",
  displayName: "Marek",
  title: "Schrottanker Graul",
  description: "Heavy armor engineer. Every piece of scrap tightens his hull.",
  shortLore: "A decorated salvage-marine who refused to leave his wreck behind — now the wreck pilots itself.",
  baseStats: {
    maxHealth: 150,
    armor: 5,
    moveSpeedPercent: -5,
    critChancePercent: 0,
    pickupRadiusPercent: 25,
  },
  passiveTrait: {
    id: "schrottkern",
    name: "Schrottkern",
    description: "Each pickup grants a temporary 5-HP shield (stacks up to 50 HP).",
  },
  branches: [
    {
      id: "magnetik",
      name: "Magnetik",
      theme: "Loot magnet & enemy slow",
      nodes: [
        { id: "mg_1", tier: 1, name: "Polarizer", description: "+X% pickup radius.", maxRanks: 5, techCost: 1, valuePerRank: 15, isPercent: true, statKey: "pickupRadius" },
        { id: "mg_2", tier: 2, name: "Scrap Tide", description: "+X% scrap gain.", maxRanks: 5, techCost: 2, valuePerRank: 8, isPercent: true, statKey: "scrapMult" },
        { id: "mg_3", tier: 3, name: "Iron Drag", description: "+X% control duration (slow auras).", maxRanks: 3, techCost: 3, valuePerRank: 10, isPercent: true, statKey: "controlDuration" },
        { id: "mg_cap", tier: 4, name: "CAPSTONE: Singularity", description: "Pickups pull all nearby enemies. +25% scrap.", maxRanks: 1, techCost: 5, valuePerRank: 25, isPercent: true, statKey: "scrapMult" },
      ],
    },
    {
      id: "drohnenwerk",
      name: "Drohnenwerk",
      theme: "Drones & automation",
      nodes: [
        { id: "dw_1", tier: 1, name: "Tin Companion", description: "+X drone count.", maxRanks: 3, techCost: 1, valuePerRank: 1, isPercent: false, statKey: "droneCount" },
        { id: "dw_2", tier: 2, name: "Overclock", description: "+X% drone fire rate.", maxRanks: 5, techCost: 2, valuePerRank: 6, isPercent: true, statKey: "fireRateMult" },
        { id: "dw_3", tier: 3, name: "Scrap Forge", description: "+X% tech gain.", maxRanks: 3, techCost: 3, valuePerRank: 8, isPercent: true, statKey: "techMult" },
        { id: "dw_cap", tier: 4, name: "CAPSTONE: Hive Protocol", description: "Drones explode on death. +1 drone.", maxRanks: 1, techCost: 5, valuePerRank: 1, isPercent: false, statKey: "droneCount" },
      ],
    },
    {
      id: "bollwerk",
      name: "Bollwerk",
      theme: "Damage reduction & taunt",
      nodes: [
        { id: "bw_1", tier: 1, name: "Plate Weaving", description: "+X armor.", maxRanks: 5, techCost: 1, valuePerRank: 2, isPercent: false, statKey: "armor" },
        { id: "bw_2", tier: 2, name: "Bulwark", description: "+X max health.", maxRanks: 5, techCost: 2, valuePerRank: 15, isPercent: false, statKey: "maxHealth" },
        { id: "bw_3", tier: 3, name: "Pickup Shield", description: "+X HP shield per pickup.", maxRanks: 3, techCost: 3, valuePerRank: 2, isPercent: false, statKey: "shieldOnPickup" },
        { id: "bw_cap", tier: 4, name: "CAPSTONE: Fortress Mode", description: "Taking damage taunts nearby enemies. +5 armor.", maxRanks: 1, techCost: 5, valuePerRank: 5, isPercent: false, statKey: "armor" },
      ],
    },
  ],
}

export const CHARACTERS: Record<CharacterId, CharacterData> = {
  rixa: RIXA,
  marek: MAREK,
}

export function getCharacter(id: CharacterId): CharacterData { return CHARACTERS[id] }

// Aggregate skill effects from allocated ranks into a stat modifier bag.
export function computeSkillStats(
  char: CharacterId,
  ranks: Record<string, number>,
): Partial<Record<StatKey, number>> {
  const out: Partial<Record<StatKey, number>> = {}
  const data = getCharacter(char)
  for (const branch of data.branches) {
    for (const node of branch.nodes) {
      const r = ranks[node.id] ?? 0
      if (r <= 0) continue
      const effective = Math.min(r, node.maxRanks) * node.valuePerRank
      out[node.statKey] = (out[node.statKey] ?? 0) + effective
    }
  }
  return out
}
