import { describe, expect, it } from 'vitest'
import { assignDefensiveMarkers, computeSetPieceShape, computeSetPieceTarget, resolveSetPieceRestart, shouldLockPlayerForSetPiece } from './setPiece'

describe('resolveSetPieceRestart', () => {
  it('awards a throw-in to the opposite team on side-line exits', () => {
    const restart = resolveSetPieceRestart(
      { kind: 'sideline', x: 8, z: 21 },
      'A',
    )

    expect(restart.type).toBe('ThrowIn')
    expect(restart.restartTeam).toBe('B')
    expect(restart.spot.z).toBe(20)
    expect(restart.spot.x).toBe(8)
  })

  it('awards a corner kick when defenders touch the ball out over their own goal line', () => {
    const restart = resolveSetPieceRestart(
      { kind: 'goalLine', x: 31, z: 10 },
      'B',
    )

    expect(restart.type).toBe('CornerKick')
    expect(restart.restartTeam).toBe('A')
    expect(restart.spot.x).toBe(30)
    expect(Math.abs(restart.spot.z)).toBe(20)
  })

  it('awards a goal kick when attackers touch the ball out over defending goal line', () => {
    const restart = resolveSetPieceRestart(
      { kind: 'goalLine', x: -31, z: 9 },
      'B',
    )

    expect(restart.type).toBe('GoalKick')
    expect(restart.restartTeam).toBe('A')
    expect(restart.spot.x).toBe(-24)
    expect(restart.spot.z).toBe(0)
  })
})

describe('shouldLockPlayerForSetPiece', () => {
  it('locks every non-kicker player during a set-piece', () => {
    expect(shouldLockPlayerForSetPiece({ team: 'A', index: 0 }, { team: 'A', index: 0 })).toBe(false)
    expect(shouldLockPlayerForSetPiece({ team: 'A', index: 1 }, { team: 'A', index: 0 })).toBe(true)
    expect(shouldLockPlayerForSetPiece({ team: 'B', index: 0 }, { team: 'A', index: 0 })).toBe(true)
  })
})

describe('computeSetPieceTarget', () => {
  it('keeps throw-in support targets in bounds and off the sideline', () => {
    const restart = {
      type: 'ThrowIn' as const,
      restartTeam: 'A' as const,
      spot: { x: 5, z: 20 },
    }

    const target = computeSetPieceTarget(restart, 'attacking', 0)
    expect(target.z).toBeLessThan(20)
    expect(target.z).toBeGreaterThan(0)
  })

  it('positions defenders deeper for corner-kick defense', () => {
    const restart = {
      type: 'CornerKick' as const,
      restartTeam: 'A' as const,
      spot: { x: 30, z: -20 },
    }

    const defender = computeSetPieceTarget(restart, 'defending', 1)
    expect(defender.x).toBeGreaterThan(20)
    expect(Math.abs(defender.z)).toBeLessThan(16)
  })
})

describe('computeSetPieceShape', () => {
  it('keeps all defending positions at least 3m from restart spot', () => {
    const restart = {
      type: 'ThrowIn' as const,
      restartTeam: 'B' as const,
      spot: { x: -8, z: 20 },
    }

    const shape = computeSetPieceShape(restart)
    for (const d of shape.defending) {
      const dx = d.x - restart.spot.x
      const dz = d.z - restart.spot.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      expect(dist).toBeGreaterThanOrEqual(3)
    }
  })

  it('spreads defending markers with at least 1.5m spacing', () => {
    const restart = {
      type: 'GoalKick' as const,
      restartTeam: 'A' as const,
      spot: { x: 24, z: 0 },
    }

    const shape = computeSetPieceShape(restart)
    for (let i = 0; i < shape.defending.length; i += 1) {
      for (let j = i + 1; j < shape.defending.length; j += 1) {
        const dx = shape.defending[i].x - shape.defending[j].x
        const dz = shape.defending[i].z - shape.defending[j].z
        const dist = Math.sqrt(dx * dx + dz * dz)
        expect(dist).toBeGreaterThanOrEqual(1.5)
      }
    }
  })
})

describe('assignDefensiveMarkers', () => {
  it('maps defenders to nearest attacking threats with compact offsets', () => {
    const threats = [
      { x: 18, z: -4 },
      { x: 22, z: 3 },
      { x: 25, z: 0 },
    ]

    const defenders = [
      { x: 16, z: -6 },
      { x: 14, z: 4 },
      { x: 15, z: 0 },
    ]

    const marked = assignDefensiveMarkers(defenders, threats)

    expect(marked).toHaveLength(3)
    expect(marked[0].x).toBeGreaterThan(16)
    expect(Math.abs(marked[1].z)).toBeLessThan(6)
    expect(marked[2].x).toBeGreaterThan(20)
  })
})
