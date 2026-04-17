import type { Team } from './Player'

/* ═══════════════════════════════════════════════════════════════════════
   Match  —  state machine, clock, scoring
   ═══════════════════════════════════════════════════════════════════════ */

export enum MatchPhase {
  WaitingToStart = 'WaitingToStart',
  KickoffSetup   = 'KickoffSetup',
  InPlay         = 'InPlay',
  GoalScored     = 'GoalScored',
  HalfTime       = 'HalfTime',
  FullTime       = 'FullTime',
  Paused         = 'Paused'
}

const HALF_DURATION   = 180  // 3 minutes per half
const GOAL_PAUSE      = 2.5  // seconds to show "GOAL!"
const HALFTIME_PAUSE  = 3.0
const KICKOFF_PAUSE   = 1.5

export class Match {
  phase = MatchPhase.WaitingToStart
  half = 1                  // 1 or 2
  clock = HALF_DURATION     // counts down
  scoreA = 0
  scoreB = 0
  private phaseTimer = 0
  private prePausePhase: Exclude<MatchPhase, MatchPhase.Paused> = MatchPhase.WaitingToStart
  lastScorer: Team | null = null

  /** Returns display string for timer */
  get timerDisplay(): string {
    const t = Math.max(0, Math.ceil(this.clock))
    const m = Math.floor(t / 60)
    const s = t % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  /** Start the match from waiting state */
  startMatch(): void {
    if (this.phase !== MatchPhase.WaitingToStart) return
    this.phase = MatchPhase.KickoffSetup
    this.phaseTimer = KICKOFF_PAUSE
    this.half = 1
    this.clock = HALF_DURATION
    this.scoreA = 0
    this.scoreB = 0
    this.lastScorer = null
  }

  /**
   * Call each frame. Returns events that the Game loop should handle.
   */
  update(delta: number): MatchEvent[] {
    const events: MatchEvent[] = []

    switch (this.phase) {
      case MatchPhase.WaitingToStart:
        break

      case MatchPhase.KickoffSetup:
        this.phaseTimer -= delta
        if (this.phaseTimer <= 0) {
          this.phase = MatchPhase.InPlay
          events.push('kickoff')
        }
        break

      case MatchPhase.InPlay:
        this.clock -= delta
        if (this.clock <= 0) {
          this.clock = 0
          if (this.half === 1) {
            this.phase = MatchPhase.HalfTime
            this.phaseTimer = HALFTIME_PAUSE
            events.push('halftime')
          } else {
            this.phase = MatchPhase.FullTime
            events.push('fulltime')
          }
        }
        break

      case MatchPhase.GoalScored:
        this.phaseTimer -= delta
        if (this.phaseTimer <= 0) {
          this.phase = MatchPhase.KickoffSetup
          this.phaseTimer = KICKOFF_PAUSE
          events.push('restart')
        }
        break

      case MatchPhase.HalfTime:
        this.phaseTimer -= delta
        if (this.phaseTimer <= 0) {
          this.half = 2
          this.clock = HALF_DURATION
          this.phase = MatchPhase.KickoffSetup
          this.phaseTimer = KICKOFF_PAUSE
          events.push('secondhalf')
        }
        break

      case MatchPhase.FullTime:
        // Game over — stay here
        break

      case MatchPhase.Paused:
        break
    }

    return events
  }

  togglePause(): MatchEvent[] {
    if (this.phase === MatchPhase.InPlay) {
      this.prePausePhase = MatchPhase.InPlay
      this.phase = MatchPhase.Paused
      return ['paused']
    }

    if (this.phase === MatchPhase.Paused) {
      this.phase = this.prePausePhase
      return ['resumed']
    }

    return []
  }

  /** Call when a goal is detected. */
  registerGoal(scoredSide: -1 | 1): void {
    if (this.phase !== MatchPhase.InPlay) return

    // scoredSide: -1 = ball went into left goal = Team B's attack direction
    // Team A attacks RIGHT (+x), Team B attacks LEFT (-x)
    // If ball goes into left goal (-x), Team A failed to defend → Team B scores
    // If ball goes into right goal (+x), Team B failed to defend → Team A scores
    if (scoredSide > 0) {
      this.scoreA++
      this.lastScorer = 'A'
    } else {
      this.scoreB++
      this.lastScorer = 'B'
    }

    this.phase = MatchPhase.GoalScored
    this.phaseTimer = GOAL_PAUSE
  }

  restartAfterFullTime(): void {
    this.phase = MatchPhase.WaitingToStart
    this.half = 1
    this.clock = HALF_DURATION
    this.scoreA = 0
    this.scoreB = 0
    this.lastScorer = null
  }
}

export type MatchEvent = 'kickoff' | 'halftime' | 'fulltime' | 'secondhalf' | 'restart' | 'paused' | 'resumed'
