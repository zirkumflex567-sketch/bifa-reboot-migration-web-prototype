import { describe, expect, it } from 'vitest'
import { Ball, BallState } from './Ball'
import { PITCH } from './World'

describe('Ball out-of-bounds events', () => {
  it('emits a sideline out event and freezes for restart', () => {
    const ball = new Ball()
    ball.position.set(0, ball.position.y, PITCH.halfWidth + 1)
    ball.velocity.set(0, 0, 6)

    ball.update(0.1)

    const out = ball.consumeOutOfBoundsEvent()
    expect(out).toEqual({
      kind: 'sideline',
      x: 0,
      z: PITCH.halfWidth,
    })
    expect(ball.state).toBe(BallState.RestartAttach)
  })

  it('emits a goal-line out event outside goal mouth and does not mark a goal', () => {
    const ball = new Ball()
    ball.position.set(PITCH.halfLength + 1, ball.position.y, PITCH.goalWidth)
    ball.velocity.set(8, 0, 0)

    ball.update(0.1)

    const out = ball.consumeOutOfBoundsEvent()
    expect(out).toEqual({
      kind: 'goalLine',
      x: PITCH.halfLength,
      z: PITCH.goalWidth,
    })
    expect(ball.scoredSide).toBe(0)
    expect(ball.state).toBe(BallState.RestartAttach)
  })
})
