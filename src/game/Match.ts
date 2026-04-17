import type { Team } from './Player'

/* ═══════════════════════════════════════════════════════════════════════
   Match  —  state machine, clock, scoring
   ═══════════════════════════════════════════════════════════════════════ */

export enum MatchPhase {
  WaitingToStart = 'WaitingToStart',
  KickoffSetup   = 'KickoffSetup',
  InPlay         = 'InPlay',
  Overtime       = 'Overtime',
  SuddenDeath    = 'SuddenDeath',
  Penalty        = 'Penalty',
  GoalScored     = 'GoalScored',
  HalfTime       = 'HalfTime',
  FullTime       = 'FullTime',
  Paused         = 'Paused'
}

const HALF_DURATION   = 180  // 3 minutes per half
const OVERTIME_DURATION = 60
const GOAL_PAUSE      = 2.5  // seconds to show "GOAL!"
const HALFTIME_PAUSE  = 3.0
const KICKOFF_PAUSE   = 1.5

export interface MatchConfig {
  halfDuration?: number
  overtimeDuration?: number
  goalPause?: number
  halftimePause?: number
  kickoffPause?: number
}

export class Match {
  phase = MatchPhase.WaitingToStart
  half = 1                  // 1 or 2
  clock = HALF_DURATION     // counts down
  scoreA = 0
  scoreB = 0
  private phaseTimer = 0
  private readonly halfDuration: number
  private readonly overtimeDuration: number
  private readonly goalPause: number
  private readonly halftimePause: number
  private readonly kickoffPause: number
  private kickoffTargetPhase: MatchPhase.InPlay | MatchPhase.Overtime | MatchPhase.SuddenDeath = MatchPhase.InPlay
  private suddenDeathDecider = false
  private prePausePhase: Exclude<MatchPhase, MatchPhase.Paused> = MatchPhase.WaitingToStart
  lastScorer: Team | null = null

  constructor(config: MatchConfig = {}) {
    this.halfDuration = config.halfDuration ?? HALF_DURATION
    this.overtimeDuration = config.overtimeDuration ?? OVERTIME_DURATION
    this.goalPause = config.goalPause ?? GOAL_PAUSE
    this.halftimePause = config.halftimePause ?? HALFTIME_PAUSE
    this.kickoffPause = config.kickoffPause ?? KICKOFF_PAUSE
    this.clock = this.halfDuration
  }

  /** Returns display string for timer */
  get timerDisplay(): string {
    if (this.phase === MatchPhase.SuddenDeath) return 'SD'
    const t = Math.max(0, Math.ceil(this.clock))
    const m = Math.floor(t / 60)
    const s = t % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  /** Start the match from waiting state */
  startMatch(): void {
    if (this.phase !== MatchPhase.WaitingToStart) return
    this.phase = MatchPhase.KickoffSetup
    this.phaseTimer = this.kickoffPause
    this.half = 1
    this.clock = this.halfDuration
    this.scoreA = 0
    this.scoreB = 0
    this.lastScorer = null
    this.kickoffTargetPhase = MatchPhase.InPlay
    this.suddenDeathDecider = false
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
          this.phase = this.kickoffTargetPhase
          events.push('kickoff')
        }
        break

      case MatchPhase.InPlay:
      case MatchPhase.Overtime:
        this.clock -= delta
        if (this.clock <= 0) {
          this.clock = 0
          if (this.phase === MatchPhase.InPlay && this.half === 1) {
            this.phase = MatchPhase.HalfTime
            this.phaseTimer = this.halftimePause
            events.push('halftime')
          } else if (this.phase === MatchPhase.InPlay && this.half === 2) {
            if (this.scoreA === this.scoreB) {
              this.phase = MatchPhase.KickoffSetup
              this.phaseTimer = this.kickoffPause
              this.clock = this.overtimeDuration
              this.kickoffTargetPhase = MatchPhase.Overtime
              events.push('overtime')
            } else {
              this.phase = MatchPhase.FullTime
              events.push('fulltime')
            }
          } else if (this.phase === MatchPhase.Overtime) {
            if (this.scoreA === this.scoreB) {
              this.phase = MatchPhase.KickoffSetup
              this.phaseTimer = this.kickoffPause
              this.kickoffTargetPhase = MatchPhase.SuddenDeath
              events.push('suddendeath')
            } else {
              this.phase = MatchPhase.FullTime
              events.push('fulltime')
            }
          } else {
            this.phase = MatchPhase.FullTime
            events.push('fulltime')
          }
        }
        break

      case MatchPhase.SuddenDeath:
        // Sudden death has no clock limit.
        break

      case MatchPhase.Penalty:
        // Controlled externally by Game penalty sequence
        break

      case MatchPhase.GoalScored:
        this.phaseTimer -= delta
        if (this.phaseTimer <= 0) {
          if (this.suddenDeathDecider) {
            this.phase = MatchPhase.FullTime
            this.suddenDeathDecider = false
            events.push('fulltime')
          } else {
            this.phase = MatchPhase.KickoffSetup
            this.phaseTimer = this.kickoffPause
            events.push('restart')
          }
        }
        break

      case MatchPhase.HalfTime:
        this.phaseTimer -= delta
        if (this.phaseTimer <= 0) {
          this.half = 2
          this.clock = this.halfDuration
          this.phase = MatchPhase.KickoffSetup
          this.phaseTimer = this.kickoffPause
          this.kickoffTargetPhase = MatchPhase.InPlay
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
    if (
      this.phase === MatchPhase.InPlay ||
      this.phase === MatchPhase.Overtime ||
      this.phase === MatchPhase.SuddenDeath
    ) {
      this.prePausePhase = this.phase
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
    if (
      this.phase !== MatchPhase.InPlay &&
      this.phase !== MatchPhase.Overtime &&
      this.phase !== MatchPhase.SuddenDeath
    ) return

    // scoredSide: -1 = ball went into left goal = Team B's attack direction
    // Team A attacks RIGHT (+x), Team B attacks LEFT (-x)
    // If ball goes into left goal (-x), Team A failed to defend → Team B scores
    // If ball goes into right goal (+x), Team B failed to defend → Team A scores
    const wasSuddenDeath = this.phase === MatchPhase.SuddenDeath

    if (scoredSide > 0) {
      this.scoreA++
      this.lastScorer = 'A'
    } else {
      this.scoreB++
      this.lastScorer = 'B'
    }

    this.phase = MatchPhase.GoalScored
    this.phaseTimer = this.goalPause
    this.suddenDeathDecider = wasSuddenDeath
  }

  registerPenaltyGoal(scoringTeam: Team): void {
    if (
      this.phase !== MatchPhase.InPlay &&
      this.phase !== MatchPhase.Overtime &&
      this.phase !== MatchPhase.SuddenDeath &&
      this.phase !== MatchPhase.Penalty
    ) return

    const wasSuddenDeath = this.phase === MatchPhase.SuddenDeath

    if (scoringTeam === 'A') {
      this.scoreA++
      this.lastScorer = 'A'
    } else {
      this.scoreB++
      this.lastScorer = 'B'
    }

    this.phase = MatchPhase.GoalScored
    this.phaseTimer = this.goalPause + 0.8
    this.suddenDeathDecider = wasSuddenDeath
  }

  startPenalty(): MatchEvent[] {
    if (
      this.phase !== MatchPhase.InPlay &&
      this.phase !== MatchPhase.Overtime &&
      this.phase !== MatchPhase.SuddenDeath
    ) return []

    this.phase = MatchPhase.Penalty
    return ['penalty-start']
  }

  resolvePenalty(scored: boolean, scoringTeam: Team = 'A'): MatchEvent[] {
    if (this.phase !== MatchPhase.Penalty) return []

    if (scored) {
      this.registerPenaltyGoal(scoringTeam)
      return ['penalty-goal']
    }

    this.phase = MatchPhase.KickoffSetup
    this.phaseTimer = this.kickoffPause
    this.kickoffTargetPhase = MatchPhase.InPlay
    this.suddenDeathDecider = false
    return ['penalty-miss', 'restart']
  }

  restartAfterFullTime(): void {
    this.phase = MatchPhase.WaitingToStart
    this.half = 1
    this.clock = this.halfDuration
    this.scoreA = 0
    this.scoreB = 0
    this.lastScorer = null
    this.kickoffTargetPhase = MatchPhase.InPlay
    this.suddenDeathDecider = false
  }
}

export type MatchEvent =
  | 'kickoff'
  | 'halftime'
  | 'fulltime'
  | 'secondhalf'
  | 'overtime'
  | 'suddendeath'
  | 'restart'
  | 'paused'
  | 'resumed'
  | 'penalty-start'
  | 'penalty-goal'
  | 'penalty-miss'
