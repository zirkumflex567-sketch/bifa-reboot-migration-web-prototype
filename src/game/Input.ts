/* ═══════════════════════════════════════════════════════════════════════
   Input  —  keyboard state tracker
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

  /** Quick helper for the active ability key */
  get wasAbilityPressed(): boolean {
    return this.wasPressed(" ")
  }

  /** Call once per frame at end of tick to clear just-pressed state. */
  endFrame(): void {
    this.justPressed.clear()
  }
}

