import type { Match } from './Match'
import { MatchPhase } from './Match'
import type { Team } from './Player'
import type { Player } from './Player'

/* ═══════════════════════════════════════════════════════════════════════
   HUD  —  HTML/CSS overlay controller
   Supports: score, timer, possession, callouts, stamina bars (P1 + P2)
   ═══════════════════════════════════════════════════════════════════════ */

export type PauseMenuAction = 'resume' | 'restart' | 'setup'

export class HUD {
  private scoreA: HTMLElement
  private scoreB: HTMLElement
  private timer: HTMLElement
  private possession: HTMLElement
  private callout: HTMLElement
  private overlay: HTMLElement
  private pauseOverlay: HTMLElement
  private pauseOptions: HTMLButtonElement[]
  private pauseSelection = 0

  // Stamina bars
  private staminaBarP2: HTMLElement | null
  private staminaFillP1: HTMLElement | null
  private staminaFillP2: HTMLElement | null
  private dashStatusP1: HTMLElement | null
  private dashStatusP2: HTMLElement | null

  private calloutTimeout = 0
  private readonly twoPlayer: boolean

  constructor(twoPlayer = false) {
    this.twoPlayer = twoPlayer

    this.scoreA    = document.getElementById('score-a')!
    this.scoreB    = document.getElementById('score-b')!
    this.timer     = document.getElementById('timer')!
    this.possession = document.getElementById('hud-possession')!
    this.callout   = document.getElementById('hud-callout')!
    this.overlay   = document.getElementById('overlay-start')!
    this.pauseOverlay = document.getElementById('overlay-pause')!
    this.pauseOptions = Array.from(document.querySelectorAll<HTMLButtonElement>('.pause-option'))

    this.staminaBarP2  = document.getElementById('stamina-bar-p2')
    this.staminaFillP1 = document.getElementById('stamina-fill-p1')
    this.staminaFillP2 = document.getElementById('stamina-fill-p2')
    this.dashStatusP1  = document.getElementById('dash-status-p1')
    this.dashStatusP2  = document.getElementById('dash-status-p2')

    // Show/hide P2 stamina bar based on mode
    if (this.staminaBarP2) {
      this.staminaBarP2.style.display = twoPlayer ? 'flex' : 'none'
    }
  }

  update(match: Match, possTeam: Team | null, p1: Player, p2: Player | null): void {
    this.scoreA.textContent = match.scoreA.toString()
    this.scoreB.textContent = match.scoreB.toString()
    this.timer.textContent  = match.timerDisplay

    // Possession
    if (possTeam === 'A') {
      this.possession.textContent = '◉ BLUE BALL'
      this.possession.style.color = '#3b8bff'
    } else if (possTeam === 'B') {
      this.possession.textContent = '◉ RED BALL'
      this.possession.style.color = '#ff4444'
    } else {
      this.possession.textContent = ''
    }

    // Stamina bars
    this.updateStaminaBar(
      this.staminaFillP1,
      this.dashStatusP1,
      p1.staminaRatio,
      p1.isDashing,
      'p1'
    )

    if (p2 && this.twoPlayer) {
      this.updateStaminaBar(
        this.staminaFillP2,
        this.dashStatusP2,
        p2.staminaRatio,
        p2.isDashing,
        'p2'
      )
    }

    // Overlay
    if (match.phase === MatchPhase.WaitingToStart) {
      this.overlay.classList.remove('hidden')
      this.hidePauseOverlay()
    } else {
      this.overlay.classList.add('hidden')
    }
  }

  private updateStaminaBar(
    fill: HTMLElement | null,
    dashEl: HTMLElement | null,
    ratio: number,
    dashing: boolean,
    player: 'p1' | 'p2'
  ): void {
    if (!fill) return
    const pct = Math.max(0, Math.min(100, ratio * 100))
    fill.style.width = `${pct}%`

    // Color coding: green → orange → red
    if (pct > 60) {
      fill.style.background = player === 'p1'
        ? 'linear-gradient(90deg,#22cc66,#33ff88)'
        : 'linear-gradient(90deg,#cc5522,#ff8833)'
    } else if (pct > 25) {
      fill.style.background = player === 'p1'
        ? 'linear-gradient(90deg,#aa8800,#ffcc00)'
        : 'linear-gradient(90deg,#886600,#ccaa00)'
    } else {
      fill.style.background = 'linear-gradient(90deg,#aa2200,#ff4400)'
    }

    if (dashEl) {
      dashEl.textContent = dashing ? '⚡ DASH!' : ratio > 0.35 ? '⚡ READY' : '⚡ LOW'
      dashEl.style.opacity = dashing ? '1' : ratio > 0.35 ? '0.6' : '0.4'
      dashEl.style.color   = dashing ? '#ffee00' : ratio > 0.35 ? '#aaddff' : '#ff6644'
    }
  }

  showCallout(text: string, duration = 2000): void {
    this.callout.textContent = text
    this.callout.classList.remove('hidden')
    void this.callout.offsetWidth
    this.callout.style.animation = 'none'
    void this.callout.offsetWidth
    this.callout.style.animation = ''

    if (this.calloutTimeout) clearTimeout(this.calloutTimeout)
    this.calloutTimeout = window.setTimeout(() => {
      this.callout.classList.add('hidden')
    }, duration)
  }

  showPauseOverlay(): void {
    this.pauseOverlay.classList.remove('hidden')
    this.setPauseSelection(0)
  }

  hidePauseOverlay(): void {
    this.pauseOverlay.classList.add('hidden')
  }

  movePauseSelection(direction: -1 | 1): void {
    if (this.pauseOptions.length === 0) return
    const next = (this.pauseSelection + direction + this.pauseOptions.length) % this.pauseOptions.length
    this.setPauseSelection(next)
  }

  getPauseSelectionAction(): PauseMenuAction {
    const option = this.pauseOptions[this.pauseSelection]
    const action = option?.dataset.action
    if (action === 'restart' || action === 'setup' || action === 'resume') {
      return action
    }
    return 'resume'
  }

  private setPauseSelection(index: number): void {
    this.pauseSelection = index
    this.pauseOptions.forEach((option, optionIndex) => {
      option.classList.toggle('active', optionIndex === index)
    })
  }

  showFullTimeOverlay(scoreA: number, scoreB: number): void {
    this.overlay.classList.remove('hidden')
    const winner = scoreA > scoreB ? '🔵 BLUE WINS!' : scoreB > scoreA ? '🔴 RED WINS!' : 'DRAW!'
    const content = this.overlay.querySelector('.overlay-content')!
    content.innerHTML = `
      <div class="overlay-badge">FULL TIME</div>
      <h1>${scoreA} — ${scoreB}</h1>
      <p class="winner-text">${winner}</p>
      <p style="margin-top:1.4rem;opacity:.7">Press <kbd>Space</kbd> to play again</p>
    `
  }
}
