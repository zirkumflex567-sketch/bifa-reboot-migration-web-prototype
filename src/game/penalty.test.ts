import { describe, expect, it } from 'vitest'
import { computeKeeperReadPenalty, computePenaltyScoringChance, resolvePenaltyOutcome } from './penalty'

describe('computePenaltyScoringChance', () => {
  it('returns higher scoring chance for wider, stronger shots', () => {
    const weakCentral = computePenaltyScoringChance({ aim: 0.05, power: 0.35 }, 0.9)
    const strongWide = computePenaltyScoringChance({ aim: 0.95, power: 0.95 }, 0.9)

    expect(strongWide).toBeGreaterThan(weakCentral)
  })
})

describe('computeKeeperReadPenalty', () => {
  it('gives stronger read penalty to accurate high-skill keepers', () => {
    const lowRead = computeKeeperReadPenalty({ aim: 0.8, power: 0.7 }, 0.3, 0.1)
    const highRead = computeKeeperReadPenalty({ aim: 0.8, power: 0.7 }, 0.95, 0.7)

    expect(highRead).toBeGreaterThan(lowRead)
  })
})

describe('resolvePenaltyOutcome', () => {
  it('favors a high-power, wide shot against strong keeper', () => {
    const result = resolvePenaltyOutcome(
      'A',
      { aim: 0.95, power: 0.95 },
      { random: () => 0.7, keeperSkill: 0.95 },
    )

    expect(result.type).toBe('goal')
  })

  it('allows keeper save on central low-power shot', () => {
    const result = resolvePenaltyOutcome(
      'B',
      { aim: 0.02, power: 0.35 },
      { random: () => 0.7, keeperSkill: 0.95 },
    )

    expect(result.type).toBe('save')
    if (result.type === 'save') {
      expect(result.rebound.length()).toBeGreaterThan(0)
    }
  })
})
