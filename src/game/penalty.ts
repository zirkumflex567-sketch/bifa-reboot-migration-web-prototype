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

export function computeKeeperReadPenalty(
  shot: PenaltyShotProfile,
  keeperSkill: number,
  randomSample: number,
): number {
  const aim = clamp(shot.aim, -1, 1)
  const keeper = clamp(keeperSkill, 0, 1)
  const keeperGuess = aim * keeper + (randomSample * 2 - 1) * (1 - keeper)
  const readError = Math.abs(keeperGuess - aim)
  const readAccuracy = 1 - clamp(readError / 1.2, 0, 1)
  const centralShotBonus = (1 - Math.abs(aim)) * 0.45

  return clamp((readAccuracy * 0.1 + centralShotBonus * 0.08) * keeper, 0, 0.18)
}

export function computeKeeperCommitPenalty(
  shot: PenaltyShotProfile,
  keeperSkill: number,
  randomSample: number,
): number {
  const keeper = clamp(keeperSkill, 0, 1)
  const power = clamp(shot.power, 0, 1)
  const aimAbs = Math.abs(clamp(shot.aim, -1, 1))
  const commitWindow = clamp(0.55 + keeper * 0.25 - power * 0.18, 0.25, 0.82)
  const committedRightTime = randomSample < commitWindow
  if (!committedRightTime) return 0

  const centralBonus = (1 - aimAbs) * 0.08
  const powerPenalty = power * 0.04
  return clamp((0.04 + centralBonus - powerPenalty) * keeper, 0, 0.08)
}

export function computeKeeperFeintPenalty(
  shot: PenaltyShotProfile,
  feintAim: number,
  keeperSkill: number,
): number {
  const aim = clamp(shot.aim, -1, 1)
  const feint = clamp(feintAim, -1, 1)
  const keeper = clamp(keeperSkill, 0, 1)
  const mismatch = Math.abs(aim - feint)
  const centrality = 1 - Math.abs(aim)

  return clamp((mismatch * 0.06 + centrality * 0.02) * keeper, 0, 0.09)
}

export function computeKeeperRecoveryDelay(shot: PenaltyShotProfile, keeperSkill: number): number {
  const power = clamp(shot.power, 0, 1)
  const aimAbs = Math.abs(clamp(shot.aim, -1, 1))
  const keeper = clamp(keeperSkill, 0, 1)

  return clamp(0.22 + power * 0.28 + (1 - keeper) * 0.18 + aimAbs * 0.1, 0.18, 0.85)
}

export function computeParryRebound(
  shootingTeam: Team,
  shot: PenaltyShotProfile,
  keeperSkill: number,
  randomSample: number,
): THREE.Vector3 {
  const goalDirection = shootingTeam === 'A' ? -1 : 1
  const aim = clamp(shot.aim, -1, 1)
  const power = clamp(shot.power, 0, 1)
  const keeper = clamp(keeperSkill, 0, 1)

  const blockToSide = aim === 0 ? (randomSample < 0.5 ? -1 : 1) : -Math.sign(aim)
  const centrality = 1 - Math.abs(aim)
  const lateral = clamp(2 + centrality * 2.2 + (1 - keeper) * 0.8, 1.8, 5)
  const forward = clamp(5.4 + power * 3.2 + keeper * 0.8, 4.5, 9.5)

  return new THREE.Vector3(8 * goalDirection, 0, lateral * blockToSide + forward * Math.sign(aim || blockToSide)).normalize()
}

export function resolvePenaltyOutcome(
  shootingTeam: Team,
  shot: PenaltyShotProfile,
  options: PenaltyOptions = {},
): PenaltyOutcome {
  const random = options.random ?? Math.random
  const keeperSkill = options.keeperSkill ?? 0.7
  const baseScoringChance = computePenaltyScoringChance(shot, keeperSkill)
  const keeperReadPenalty = computeKeeperReadPenalty(shot, keeperSkill, random())
  const keeperCommitPenalty = computeKeeperCommitPenalty(shot, keeperSkill, random())
  const feintAim = Math.sin(random() * Math.PI * 2) * 0.85
  const keeperFeintPenalty = computeKeeperFeintPenalty(shot, feintAim, keeperSkill)
  const scoringChance = clamp(baseScoringChance - keeperReadPenalty - keeperCommitPenalty - keeperFeintPenalty, 0.08, 0.94)

  if (random() < scoringChance) {
    return { type: 'goal' }
  }

  const rebound = computeParryRebound(shootingTeam, shot, keeperSkill, random())
  return { type: 'save', rebound }
}
