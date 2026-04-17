import { describe, expect, it } from 'vitest'
import { resolvePenaltyOutcome } from './penalty'

describe('resolvePenaltyOutcome', () => {
  it('returns goal when roll is under scoring chance', () => {
    const result = resolvePenaltyOutcome('A', { random: () => 0.2 })
    expect(result.type).toBe('goal')
  })

  it('returns save with rebound vector when roll is over scoring chance', () => {
    const result = resolvePenaltyOutcome('B', { random: () => 0.95 })
    expect(result.type).toBe('save')
    if (result.type === 'save') {
      expect(result.rebound.x).toBeGreaterThan(0)
      expect(Math.abs(result.rebound.z)).toBeGreaterThan(0)
    }
  })
})
