export const SAVE_VERSION = "1.0.0"
export const SAVE_STORAGE_KEY = "bifa.save.v1"

export type RunOutcome = "Unknown" | "Extracted" | "Died" | "Survivor"
export type CharacterId = "rixa" | "marek"
export type UnlockType = "Weapon" | "Upgrade" | "Vehicle" | "Cosmetic" | "Bounty"

export interface SaveMetadata {
  version: string
  lastSaveTimeUnixMs: number
  totalPlaySessions: number
  gameVersion: string
}

export interface MetaProgress {
  totalScrap: number
  totalTech: number
  runsCompleted: number
  bestTimeSeconds: number
  totalEnemiesKilled: number
  unlockedWeapons: string[]
  unlockedUpgrades: string[]
  unlockedCosmetics: string[]
  unlockedCharacters: CharacterId[]
  unlockedVehicles: string[]
  unlockedSpecialRewards: string[]
  unlockedBounties: string[]
  skillTech: Record<CharacterId, Record<string, number>>
}

export interface RunData {
  dateUnixMs: number
  durationSeconds: number
  wave: number
  enemiesKilled: number
  scrapEarned: number
  techEarned: number
  experienceEarned: number
  upgradesUsed: string[]
  selectedCharacterId: CharacterId | null
  selectedVehicleId: string | null
  selectedBountyIds: string[]
  specialRewardIds: string[]
  wasExtracted: boolean
  outcome: RunOutcome
  playerCount: number
}

export interface SaveGame {
  metadata: SaveMetadata
  metaProgress: MetaProgress
  lastRun: RunData
}

export function defaultRunData(): RunData {
  return {
    dateUnixMs: 0,
    durationSeconds: 0,
    wave: 0,
    enemiesKilled: 0,
    scrapEarned: 0,
    techEarned: 0,
    experienceEarned: 0,
    upgradesUsed: [],
    selectedCharacterId: null,
    selectedVehicleId: null,
    selectedBountyIds: [],
    specialRewardIds: [],
    wasExtracted: false,
    outcome: "Unknown",
    playerCount: 1,
  }
}

export function defaultSave(): SaveGame {
  return {
    metadata: {
      version: SAVE_VERSION,
      lastSaveTimeUnixMs: 0,
      totalPlaySessions: 0,
      gameVersion: SAVE_VERSION,
    },
    metaProgress: {
      totalScrap: 0,
      totalTech: 0,
      runsCompleted: 0,
      bestTimeSeconds: 0,
      totalEnemiesKilled: 0,
      unlockedWeapons: ["weapon_autocannon"],
      unlockedUpgrades: [],
      unlockedCosmetics: [],
      unlockedCharacters: ["rixa", "marek"],
      unlockedVehicles: ["vehicle_schrotty"],
      unlockedSpecialRewards: [],
      unlockedBounties: [],
      skillTech: { rixa: {}, marek: {} },
    },
    lastRun: defaultRunData(),
  }
}

const isStr = (v: unknown): v is string => typeof v === "string"
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v)
const isBool = (v: unknown): v is boolean => typeof v === "boolean"
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr)

export function validateSave(raw: unknown): SaveGame | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  const meta = r.metadata as Record<string, unknown> | undefined
  const mp = r.metaProgress as Record<string, unknown> | undefined
  const lr = r.lastRun as Record<string, unknown> | undefined
  if (!meta || !mp || !lr) return null
  if (!isStr(meta.version)) return null

  const fallback = defaultSave()
  const out: SaveGame = {
    metadata: {
      version: isStr(meta.version) ? meta.version : SAVE_VERSION,
      lastSaveTimeUnixMs: isNum(meta.lastSaveTimeUnixMs) ? meta.lastSaveTimeUnixMs : 0,
      totalPlaySessions: isNum(meta.totalPlaySessions) ? meta.totalPlaySessions : 0,
      gameVersion: isStr(meta.gameVersion) ? meta.gameVersion : SAVE_VERSION,
    },
    metaProgress: {
      totalScrap: isNum(mp.totalScrap) ? mp.totalScrap : 0,
      totalTech: isNum(mp.totalTech) ? mp.totalTech : 0,
      runsCompleted: isNum(mp.runsCompleted) ? mp.runsCompleted : 0,
      bestTimeSeconds: isNum(mp.bestTimeSeconds) ? mp.bestTimeSeconds : 0,
      totalEnemiesKilled: isNum(mp.totalEnemiesKilled) ? mp.totalEnemiesKilled : 0,
      unlockedWeapons: isStrArr(mp.unlockedWeapons) ? mp.unlockedWeapons : fallback.metaProgress.unlockedWeapons,
      unlockedUpgrades: isStrArr(mp.unlockedUpgrades) ? mp.unlockedUpgrades : [],
      unlockedCosmetics: isStrArr(mp.unlockedCosmetics) ? mp.unlockedCosmetics : [],
      unlockedCharacters: (isStrArr(mp.unlockedCharacters) ? mp.unlockedCharacters : fallback.metaProgress.unlockedCharacters) as CharacterId[],
      unlockedVehicles: isStrArr(mp.unlockedVehicles) ? mp.unlockedVehicles : fallback.metaProgress.unlockedVehicles,
      unlockedSpecialRewards: isStrArr(mp.unlockedSpecialRewards) ? mp.unlockedSpecialRewards : [],
      unlockedBounties: isStrArr(mp.unlockedBounties) ? mp.unlockedBounties : [],
      skillTech: normalizeSkillTech(mp.skillTech),
    },
    lastRun: validateRunData(lr) ?? defaultRunData(),
  }
  return out
}

function normalizeSkillTech(raw: unknown): Record<CharacterId, Record<string, number>> {
  const result: Record<CharacterId, Record<string, number>> = { rixa: {}, marek: {} }
  if (!raw || typeof raw !== "object") return result
  const r = raw as Record<string, unknown>
  for (const char of ["rixa", "marek"] as CharacterId[]) {
    const branch = r[char]
    if (branch && typeof branch === "object") {
      for (const [k, v] of Object.entries(branch as Record<string, unknown>)) {
        if (isNum(v)) result[char][k] = Math.max(0, Math.floor(v))
      }
    }
  }
  return result
}

function validateRunData(raw: Record<string, unknown>): RunData | null {
  return {
    dateUnixMs: isNum(raw.dateUnixMs) ? raw.dateUnixMs : 0,
    durationSeconds: isNum(raw.durationSeconds) ? raw.durationSeconds : 0,
    wave: isNum(raw.wave) ? raw.wave : 0,
    enemiesKilled: isNum(raw.enemiesKilled) ? raw.enemiesKilled : 0,
    scrapEarned: isNum(raw.scrapEarned) ? raw.scrapEarned : 0,
    techEarned: isNum(raw.techEarned) ? raw.techEarned : 0,
    experienceEarned: isNum(raw.experienceEarned) ? raw.experienceEarned : 0,
    upgradesUsed: isStrArr(raw.upgradesUsed) ? raw.upgradesUsed : [],
    selectedCharacterId: (raw.selectedCharacterId === "rixa" || raw.selectedCharacterId === "marek") ? raw.selectedCharacterId : null,
    selectedVehicleId: isStr(raw.selectedVehicleId) ? raw.selectedVehicleId : null,
    selectedBountyIds: isStrArr(raw.selectedBountyIds) ? raw.selectedBountyIds : [],
    specialRewardIds: isStrArr(raw.specialRewardIds) ? raw.specialRewardIds : [],
    wasExtracted: isBool(raw.wasExtracted) ? raw.wasExtracted : false,
    outcome: (raw.outcome === "Extracted" || raw.outcome === "Died" || raw.outcome === "Survivor" || raw.outcome === "Unknown") ? raw.outcome : "Unknown",
    playerCount: isNum(raw.playerCount) ? raw.playerCount : 1,
  }
}
