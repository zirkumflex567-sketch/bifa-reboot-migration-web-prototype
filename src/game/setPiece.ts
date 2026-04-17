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
