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

  it('toggles pause during active play without consuming match clock', () => {
    const match = new Match()
    match.startMatch()
    match.update(2)

    const beforePauseClock = match.clock
    const pauseEvents = match.togglePause()

    expect(pauseEvents).toContain('paused')
    expect(match.phase).toBe(MatchPhase.Paused)

    match.update(30)
    expect(match.clock).toBe(beforePauseClock)

    const resumeEvents = match.togglePause()
    expect(resumeEvents).toContain('resumed')
    expect(match.phase).toBe(MatchPhase.InPlay)
  })

  it('ignores pause toggle when match is not in-play', () => {
    const match = new Match()

    const events = match.togglePause()

    expect(events).toEqual([])
    expect(match.phase).toBe(MatchPhase.WaitingToStart)
  })

  it('returns to kickoff setup after goal pause elapses', () => {
    const match = new Match()
    match.startMatch()
    match.update(2)
    match.registerGoal(1)

    const events = match.update(3)

    expect(events).toContain('restart')
    expect(match.phase).toBe(MatchPhase.KickoffSetup)
  })

  it('restartAfterFullTime resets scores, clock and phase', () => {
    const match = new Match()
    match.startMatch()
    match.update(2)
    match.registerGoal(1)
    match.update(3)
    match.update(2)
    match.update(181)
    match.update(4)
    match.update(2)
    match.update(181)

    expect(match.phase).toBe(MatchPhase.FullTime)

    match.restartAfterFullTime()

    expect(match.phase).toBe(MatchPhase.WaitingToStart)
    expect(match.half).toBe(1)
    expect(match.clock).toBe(180)
    expect(match.scoreA).toBe(0)
    expect(match.scoreB).toBe(0)
    expect(match.lastScorer).toBeNull()
  })
})
