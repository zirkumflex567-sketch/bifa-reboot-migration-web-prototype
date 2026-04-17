import { describe, expect, it } from 'vitest'
import { resolveSetPieceRestart, shouldLockPlayerForSetPiece } from './setPiece'

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
