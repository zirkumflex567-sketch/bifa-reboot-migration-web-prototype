/* ═══════════════════════════════════════════════════════════════════════
   Input  —  dual-keyboard tracker (P1: WASD, P2: Arrows)
   ═══════════════════════════════════════════════════════════════════════ */

export class Input {
  private readonly pressed = new Set<string>()
  private readonly justPressed = new Set<string>()

  constructor() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase()
      if (!this.pressed.has(key)) {
        this.justPressed.add(key)
      }
      this.pressed.add(key)
      // Prevent arrow key scrolling / tab focus steal
      if (['arrowup','arrowdown','arrowleft','arrowright',' ','tab'].includes(key)) {
        e.preventDefault()
      }
    })

    window.addEventListener('keyup', (e) => {
      this.pressed.delete(e.key.toLowerCase())
    })

    window.addEventListener('blur', () => {
      this.pressed.clear()
      this.justPressed.clear()
    })
  }

  /** Returns true while any of the listed keys is held down. */
  isDown(...keys: string[]): boolean {
    return keys.some((k) => this.pressed.has(k.toLowerCase()))
  }

  /** Returns true only on the first frame the key was pressed. */
  wasPressed(...keys: string[]): boolean {
    return keys.some((k) => this.justPressed.has(k.toLowerCase()))
  }

  /** Call once per frame at end of tick to clear just-pressed state. */
  endFrame(): void {
    this.justPressed.clear()
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   InputBinding  —  per-player key map
   ═══════════════════════════════════════════════════════════════════════ */

export interface PlayerBindings {
  up: string[]
  down: string[]
  left: string[]
  right: string[]
  sprint: string[]    // hold for sprint
  dash: string[]      // tap for turbo dash
  pass: string[]
  shoot: string[]
  tackle: string[]
}

/** Player 1: WASD + Shift/Ctrl/Space/E/Q */
export const P1_BINDINGS: PlayerBindings = {
  up:     ['w', 'arrowup'],
  down:   ['s', 'arrowdown'],
  left:   ['a', 'arrowleft'],
  right:  ['d', 'arrowright'],
  sprint: ['shift'],
  dash:   ['control'],
  pass:   [' '],
  shoot:  ['e'],
  tackle: ['q'],
}

/** Player 2: IJKL + RShift/RCtrl/Enter/P/L */
export const P2_BINDINGS: PlayerBindings = {
  up:     ['i'],
  down:   ['k'],
  left:   ['j'],
  right:  ['l'],
  sprint: ['shift'],
  dash:   ['u'],
  pass:   ['enter'],
  shoot:  ['p'],
  tackle: ['o'],
}
