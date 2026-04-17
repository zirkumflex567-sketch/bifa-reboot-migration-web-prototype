import * as THREE from 'three'
import type { Team } from './Player'

export type PenaltyOutcome =
  | { type: 'goal' }
  | { type: 'save'; rebound: THREE.Vector3 }

export interface PenaltyShotProfile {
  aim: number // -1..1 (left..right)
  power: number // 0..1
}

export interface PenaltyOptions {
  random?: () => number
  keeperSkill?: number // 0..1
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function computePenaltyScoringChance(
  shot: PenaltyShotProfile,
  keeperSkill: number,
): number {
  const aim = Math.abs(clamp(shot.aim, -1, 1))
  const power = clamp(shot.power, 0, 1)
  const keeper = clamp(keeperSkill, 0, 1)

  const base = 0.54
  const aimBonus = aim * 0.24
  const powerBonus = power * 0.2
  const keeperPenalty = keeper * (0.18 - aim * 0.1 - power * 0.07)

  return clamp(base + aimBonus + powerBonus - keeperPenalty, 0.1, 0.94)
}

export function resolvePenaltyOutcome(
  shootingTeam: Team,
  shot: PenaltyShotProfile,
  options: PenaltyOptions = {},
): PenaltyOutcome {
  const random = options.random ?? Math.random
  const keeperSkill = options.keeperSkill ?? 0.7
  const scoringChance = computePenaltyScoringChance(shot, keeperSkill)

  if (random() < scoringChance) {
    return { type: 'goal' }
  }

  const goalDirection = shootingTeam === 'A' ? -1 : 1
  const zDirection = shot.aim === 0 ? (random() < 0.5 ? -1 : 1) : Math.sign(shot.aim)
  const rebound = new THREE.Vector3(8 * goalDirection, 0, 2 + 5 * zDirection).normalize()
  return { type: 'save', rebound }
}
