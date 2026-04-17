// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { HUD } from './HUD'
import { MatchPhase } from './Match'

function mountHudDom(): void {
  document.body.innerHTML = `
    <div id="score-a"></div>
    <div id="score-b"></div>
    <div id="timer"></div>
    <div id="hud-possession"></div>
    <div id="hud-callout" class="hidden"></div>
    <div id="overlay-start"></div>
    <div id="overlay-pause" class="hidden"></div>
    <div id="stamina-bar-p2"></div>
    <div id="stamina-fill-p1"></div>
    <div id="stamina-fill-p2"></div>
    <div id="dash-status-p1"></div>
    <div id="dash-status-p2"></div>
    <button class="pause-option" data-action="resume">Resume Match</button>
    <button class="pause-option" data-action="restart">Restart Match</button>
    <button class="pause-option" data-action="setup">Back to Setup</button>
  `
}

describe('HUD pause interactions', () => {
  it('dispatches click action from pause menu buttons', () => {
    mountHudDom()
    const hud = new HUD(false)
    let action: string | null = null
    hud.onPauseAction((next) => {
      action = next
    })

    const restartButton = document.querySelectorAll<HTMLButtonElement>('.pause-option')[1]
    restartButton.click()

    expect(action).toBe('restart')
  })

  it('hides pause overlay when entering waiting-to-start state', () => {
    mountHudDom()
    const hud = new HUD(false)

    const overlayStart = document.getElementById('overlay-start')!
    const overlayPause = document.getElementById('overlay-pause')!
    overlayPause.classList.remove('hidden')

    const fakeMatch = {
      phase: MatchPhase.WaitingToStart,
      scoreA: 0,
      scoreB: 0,
      timerDisplay: '3:00',
    }

    const fakeP1 = {
      staminaRatio: 1,
      isDashing: false,
    }

    hud.update(fakeMatch as unknown as import('./Match').Match, null, fakeP1 as unknown as import('./Player').Player, null)

    expect(overlayStart.classList.contains('hidden')).toBe(false)
    expect(overlayPause.classList.contains('hidden')).toBe(true)
  })
})
