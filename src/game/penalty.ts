import * as THREE from 'three'
import type { Team } from './Player'

export type PenaltyOutcome =
  | { type: 'goal' }
  | { type: 'save'; rebound: THREE.Vector3 }

export interface PenaltyOptions {
  random?: () => number
  scoringChance?: number
}

export function resolvePenaltyOutcome(
  shootingTeam: Team,
  options: PenaltyOptions = {},
): PenaltyOutcome {
  const random = options.random ?? Math.random
  const scoringChance = options.scoringChance ?? 0.72

  if (random() < scoringChance) {
    return { type: 'goal' }
  }

  const goalDirection = shootingTeam === 'A' ? -1 : 1
  const zVariance = random() < 0.5 ? -1 : 1
  const rebound = new THREE.Vector3(8 * goalDirection, 0, 4 * zVariance).normalize()
  return { type: 'save', rebound }
}
