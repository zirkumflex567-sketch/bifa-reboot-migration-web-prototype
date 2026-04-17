import { PITCH } from './World'
import type { Team } from './Player'

export type SetPieceType = 'ThrowIn' | 'CornerKick' | 'GoalKick'

export interface RestartSpot {
  x: number
  z: number
}

export interface SetPieceRestart {
  type: SetPieceType
  restartTeam: Team
  spot: RestartSpot
}

export type SetPieceVariant = 'default' | 'short' | 'near-post' | 'far-post'
export type DefensiveSetPieceMode = 'hold' | 'contain' | 'press'

export interface BallOutEvent {
  kind: 'sideline' | 'goalLine'
  x: number
  z: number
}

export interface PlayerIdentity {
  team: Team
  index: number
}

function oppositeTeam(team: Team): Team {
  return team === 'A' ? 'B' : 'A'
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function defendingTeamForGoalLine(x: number): Team {
  return x < 0 ? 'A' : 'B'
}

function isAttackingTouchOnGoalLine(lastTouchTeam: Team, x: number): boolean {
  const defending = defendingTeamForGoalLine(x)
  return lastTouchTeam !== defending
}

function getThrowInSpot(out: BallOutEvent): RestartSpot {
  return {
    x: clamp(out.x, -PITCH.halfLength, PITCH.halfLength),
    z: Math.sign(out.z || 1) * PITCH.halfWidth,
  }
}

function getCornerSpot(out: BallOutEvent): RestartSpot {
  return {
    x: Math.sign(out.x || 1) * PITCH.halfLength,
    z: Math.sign(out.z || 1) * PITCH.halfWidth,
  }
}

function getGoalKickSpot(out: BallOutEvent): RestartSpot {
  const side = Math.sign(out.x || 1)
  return {
    x: side * (PITCH.halfLength - 6),
    z: 0,
  }
}

export function resolveSetPieceRestart(out: BallOutEvent, lastTouchTeam: Team): SetPieceRestart {
  const restartTeam = oppositeTeam(lastTouchTeam)

  if (out.kind === 'sideline') {
    return {
      type: 'ThrowIn',
      restartTeam,
      spot: getThrowInSpot(out),
    }
  }

  if (isAttackingTouchOnGoalLine(lastTouchTeam, out.x)) {
    return {
      type: 'GoalKick',
      restartTeam,
      spot: getGoalKickSpot(out),
    }
  }

  return {
    type: 'CornerKick',
    restartTeam,
    spot: getCornerSpot(out),
  }
}

export function shouldLockPlayerForSetPiece(player: PlayerIdentity, kicker: PlayerIdentity): boolean {
  return player.team !== kicker.team || player.index !== kicker.index
}

function projectInfieldDistance(z: number, amount: number): number {
  return z > 0 ? z - amount : z + amount
}

export function computeSetPieceTarget(
  restart: SetPieceRestart,
  side: 'attacking' | 'defending',
  slot: number,
): RestartSpot {
  const clampedSlot = Math.max(0, Math.min(slot, 2))
  const x = restart.spot.x
  const z = restart.spot.z

  if (restart.type === 'ThrowIn') {
    const xOffset = side === 'attacking' ? 5 + clampedSlot * 3 : -4 - clampedSlot * 2
    const inward = side === 'attacking' ? 4 + clampedSlot * 2 : 8 + clampedSlot * 1.5
    return {
      x: clamp(x + xOffset, -PITCH.halfLength + 2, PITCH.halfLength - 2),
      z: clamp(projectInfieldDistance(z, inward), -PITCH.halfWidth + 2, PITCH.halfWidth - 2),
    }
  }

  if (restart.type === 'CornerKick') {
    const goalSide = Math.sign(x || 1)
    const zSide = Math.sign(z || 1)
    if (side === 'attacking') {
      return {
        x: clamp(goalSide * (PITCH.halfLength - (6 + clampedSlot * 3)), -PITCH.halfLength + 2, PITCH.halfLength - 2),
        z: clamp(zSide * (PITCH.goalWidth / 2 - clampedSlot * 2.2), -PITCH.halfWidth + 2, PITCH.halfWidth - 2),
      }
    }

    return {
      x: clamp(goalSide * (PITCH.halfLength - (3 + clampedSlot * 2)), -PITCH.halfLength + 2, PITCH.halfLength - 2),
      z: clamp(zSide * (PITCH.goalWidth / 2 + 2 + clampedSlot * 2.5), -PITCH.halfWidth + 2, PITCH.halfWidth - 2),
    }
  }

  // Goal kick
  const sideSign = Math.sign(x || 1)
  if (side === 'attacking') {
    return {
      x: clamp(sideSign * (PITCH.halfLength - (11 + clampedSlot * 5)), -PITCH.halfLength + 2, PITCH.halfLength - 2),
      z: clamp((clampedSlot - 1) * 7, -PITCH.halfWidth + 2, PITCH.halfWidth - 2),
    }
  }

  return {
    x: clamp(sideSign * (PITCH.halfLength - (18 + clampedSlot * 4)), -PITCH.halfLength + 2, PITCH.halfLength - 2),
    z: clamp((clampedSlot - 1) * 6, -PITCH.halfWidth + 2, PITCH.halfWidth - 2),
  }
}

function enforceDefenderSpacing(
  defenders: RestartSpot[],
  restartSpot: RestartSpot,
  minToBall = 3,
  minBetween = 1.5,
): RestartSpot[] {
  const adjusted = defenders.map((d) => ({ ...d }))

  for (const d of adjusted) {
    const dx = d.x - restartSpot.x
    const dz = d.z - restartSpot.z
    const dist = Math.hypot(dx, dz)
    if (dist < minToBall) {
      const nx = dist > 0 ? dx / dist : 1
      const nz = dist > 0 ? dz / dist : 0
      d.x = clamp(restartSpot.x + nx * minToBall, -PITCH.halfLength + 2, PITCH.halfLength - 2)
      d.z = clamp(restartSpot.z + nz * minToBall, -PITCH.halfWidth + 2, PITCH.halfWidth - 2)
    }
  }

  for (let i = 0; i < adjusted.length; i += 1) {
    for (let j = i + 1; j < adjusted.length; j += 1) {
      const a = adjusted[i]
      const b = adjusted[j]
      const dx = b.x - a.x
      const dz = b.z - a.z
      const dist = Math.hypot(dx, dz)
      if (dist < minBetween) {
        const nx = dist > 0 ? dx / dist : 0
        const nz = dist > 0 ? dz / dist : 1
        const push = (minBetween - dist) / 2
        a.x = clamp(a.x - nx * push, -PITCH.halfLength + 2, PITCH.halfLength - 2)
        a.z = clamp(a.z - nz * push, -PITCH.halfWidth + 2, PITCH.halfWidth - 2)
        b.x = clamp(b.x + nx * push, -PITCH.halfLength + 2, PITCH.halfLength - 2)
        b.z = clamp(b.z + nz * push, -PITCH.halfWidth + 2, PITCH.halfWidth - 2)
      }
    }
  }

  return adjusted
}

export function computeSetPieceShape(restart: SetPieceRestart): { attacking: RestartSpot[]; defending: RestartSpot[] } {
  const attacking = [0, 1].map((slot) => computeSetPieceTarget(restart, 'attacking', slot))
  const defendingBase = [0, 1, 2].map((slot) => computeSetPieceTarget(restart, 'defending', slot))
  const defending = enforceDefenderSpacing(defendingBase, restart.spot)
  return { attacking, defending }
}

export function chooseSetPieceVariant(restart: SetPieceRestart): SetPieceVariant {
  if (restart.type === 'GoalKick') return 'default'
  const nearCorner = restart.type === 'CornerKick' && Math.abs(restart.spot.x) >= PITCH.halfLength - 0.5
  const nearMiddleThrow = restart.type === 'ThrowIn' && Math.abs(restart.spot.x) < PITCH.halfLength * 0.55

  if (nearCorner) {
    return restart.spot.z > 0 ? 'near-post' : 'far-post'
  }

  return nearMiddleThrow ? 'short' : 'default'
}

export function applySetPieceVariant(
  restart: SetPieceRestart,
  attacking: RestartSpot[],
  variant: SetPieceVariant,
): RestartSpot[] {
  if (variant === 'default') return attacking.map((p) => ({ ...p }))

  if (variant === 'short') {
    return attacking.map((target, idx) => {
      const shortBias = idx === 0 ? 0.62 : 0.35
      return {
        x: clamp(target.x * (1 - shortBias) + restart.spot.x * shortBias, -PITCH.halfLength + 2, PITCH.halfLength - 2),
        z: clamp(target.z * (1 - shortBias) + restart.spot.z * shortBias, -PITCH.halfWidth + 2, PITCH.halfWidth - 2),
      }
    })
  }

  if (variant === 'near-post') {
    const zSide = Math.sign(restart.spot.z || 1)
    return attacking.map((target, idx) => ({
      x: clamp(target.x + (idx === 0 ? 1.8 : 0.8), -PITCH.halfLength + 2, PITCH.halfLength - 2),
      z: clamp(zSide * (PITCH.goalWidth * (idx === 0 ? 0.28 : 0.14)), -PITCH.halfWidth + 2, PITCH.halfWidth - 2),
    }))
  }

  const zSide = Math.sign(restart.spot.z || 1)
  return attacking.map((target, idx) => ({
    x: clamp(target.x - (idx === 0 ? 0.9 : 0.2), -PITCH.halfLength + 2, PITCH.halfLength - 2),
    z: clamp(-zSide * (PITCH.goalWidth * (idx === 0 ? 0.34 : 0.2)), -PITCH.halfWidth + 2, PITCH.halfWidth - 2),
  }))
}

export function assignDefensiveMarkers(defenders: RestartSpot[], threats: RestartSpot[]): RestartSpot[] {
  if (defenders.length === 0 || threats.length === 0) return defenders.map((d) => ({ ...d }))

  const assigned = defenders.map((d) => ({ ...d }))
  const usedThreatIndices = new Set<number>()

  for (let i = 0; i < assigned.length; i += 1) {
    const defender = assigned[i]
    let bestThreat = -1
    let bestDistance = Number.POSITIVE_INFINITY

    for (let t = 0; t < threats.length; t += 1) {
      if (usedThreatIndices.has(t)) continue
      const dx = defender.x - threats[t].x
      const dz = defender.z - threats[t].z
      const dist = dx * dx + dz * dz
      if (dist < bestDistance) {
        bestDistance = dist
        bestThreat = t
      }
    }

    const chosenThreat = bestThreat >= 0 ? threats[bestThreat] : threats[i % threats.length]
    if (bestThreat >= 0) usedThreatIndices.add(bestThreat)

    const towardThreatX = chosenThreat.x - defender.x
    const towardThreatZ = chosenThreat.z - defender.z
    const len = Math.hypot(towardThreatX, towardThreatZ) || 1
    const markDistance = 2.2

    defender.x = clamp(chosenThreat.x - (towardThreatX / len) * markDistance, -PITCH.halfLength + 2, PITCH.halfLength - 2)
    defender.z = clamp(chosenThreat.z - (towardThreatZ / len) * markDistance, -PITCH.halfWidth + 2, PITCH.halfWidth - 2)
  }

  return assigned
}

export function computeAdaptiveDefensiveMarking(
  defenders: RestartSpot[],
  threats: RestartSpot[],
  ball: RestartSpot,
): RestartSpot[] {
  if (defenders.length === 0) return []

  const baseMarked = assignDefensiveMarkers(defenders, threats.length > 0 ? threats : [ball])
  const ballThreatWeight = threats.length > 0 ? 0.28 : 0.46

  return baseMarked.map((marker) => {
    const blendedX = marker.x * (1 - ballThreatWeight) + ball.x * ballThreatWeight
    const blendedZ = marker.z * (1 - ballThreatWeight) + ball.z * ballThreatWeight
    return {
      x: clamp(blendedX, -PITCH.halfLength + 2, PITCH.halfLength - 2),
      z: clamp(blendedZ, -PITCH.halfWidth + 2, PITCH.halfWidth - 2),
    }
  })
}

export function computeHybridDefensiveAssignments(
  defenders: RestartSpot[],
  threats: RestartSpot[],
  ball: RestartSpot,
): RestartSpot[] {
  if (defenders.length === 0) return []
  if (defenders.length < 3) return computeAdaptiveDefensiveMarking(defenders, threats, ball)

  const sortedDefenders = defenders
    .map((d, idx) => ({ d, idx }))
    .sort((a, b) => Math.abs(a.d.z - ball.z) - Math.abs(b.d.z - ball.z))

  const zonalAnchor = {
    x: clamp(ball.x - 2.4, -PITCH.halfLength + 2, PITCH.halfLength - 2),
    z: clamp(ball.z, -PITCH.halfWidth + 2, PITCH.halfWidth - 2),
  }

  const manTargets = computeAdaptiveDefensiveMarking(defenders, threats, ball)
  const result = manTargets.map((p) => ({ ...p }))
  result[sortedDefenders[0].idx] = zonalAnchor
  return result
}

export function computeDefensiveReactionIntensity(ball: RestartSpot, restartSpot: RestartSpot): number {
  const dx = ball.x - restartSpot.x
  const dz = ball.z - restartSpot.z
  const dist = Math.hypot(dx, dz)
  return clamp(1 - dist / 16, 0.25, 1)
}

export function chooseDefensiveSetPieceMode(restart: SetPieceRestart, reactionIntensity: number): DefensiveSetPieceMode {
  if (restart.type === 'GoalKick') {
    return reactionIntensity > 0.7 ? 'contain' : 'hold'
  }
  if (restart.type === 'CornerKick') {
    return reactionIntensity > 0.66 ? 'press' : 'contain'
  }
  return reactionIntensity > 0.62 ? 'press' : 'contain'
}
