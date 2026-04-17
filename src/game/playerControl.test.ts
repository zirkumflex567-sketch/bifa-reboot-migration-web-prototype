import { describe, expect, it } from 'vitest'
import { chooseAutoControlledPlayerIndex, nextControlledPlayerIndex } from './playerControl'

describe('nextControlledPlayerIndex', () => {
  it('cycles to the next teammate and wraps around', () => {
    expect(nextControlledPlayerIndex(0, 3)).toBe(1)
    expect(nextControlledPlayerIndex(2, 3)).toBe(0)
  })
})

describe('chooseAutoControlledPlayerIndex', () => {
  it('prefers the current ball carrier on the controlled team', () => {
    const idx = chooseAutoControlledPlayerIndex(
      [
        { x: -2, z: 0, hasBall: false },
        { x: 4, z: 1, hasBall: true },
        { x: 6, z: -2, hasBall: false },
      ],
      { x: 0, z: 0 },
      0,
    )

    expect(idx).toBe(1)
  })

  it('otherwise picks the nearest teammate to the ball', () => {
    const idx = chooseAutoControlledPlayerIndex(
      [
        { x: -10, z: 0, hasBall: false },
        { x: -4, z: 1, hasBall: false },
        { x: 7, z: 6, hasBall: false },
      ],
      { x: -3, z: 2 },
      2,
    )

    expect(idx).toBe(1)
  })

  it('falls back to the current index when there are no teammates', () => {
    expect(chooseAutoControlledPlayerIndex([], { x: 0, z: 0 }, 2)).toBe(2)
  })
})
