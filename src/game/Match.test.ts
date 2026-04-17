import { describe, expect, it } from 'vitest'
import { Match, MatchPhase } from './Match'

describe('Match', () => {
  it('clears last scorer when starting a new match', () => {
    const match = new Match()
    match.lastScorer = 'A'

    match.startMatch()

    expect(match.phase).toBe(MatchPhase.KickoffSetup)
    expect(match.lastScorer).toBeNull()
  })

  it('enters halftime and emits halftime event when first half clock expires', () => {
    const match = new Match()
    match.startMatch()

    const kickoffEvents = match.update(2)
    expect(kickoffEvents).toContain('kickoff')
    expect(match.phase).toBe(MatchPhase.InPlay)

    const events = match.update(181)

    expect(events).toContain('halftime')
    expect(match.phase).toBe(MatchPhase.HalfTime)
    expect(match.half).toBe(1)
    expect(match.clock).toBe(0)
  })

  it('increments score and enters goal phase when goal is registered in play', () => {
    const match = new Match()
    match.startMatch()
    match.update(2)

    match.registerGoal(1)

    expect(match.scoreA).toBe(1)
    expect(match.scoreB).toBe(0)
    expect(match.lastScorer).toBe('A')
    expect(match.phase).toBe(MatchPhase.GoalScored)
  })
})
