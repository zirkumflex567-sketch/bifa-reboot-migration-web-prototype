import * as THREE from 'three'
import { Input, P1_BINDINGS, P2_BINDINGS } from './Input'
import { Player } from './Player'
import { Ball, BallState } from './Ball'
import { Match, MatchPhase } from './Match'
import type { MatchConfig } from './Match'
import type { MatchEvent } from './Match'
import { HUD } from './HUD'
import type { PauseMenuAction } from './HUD'
import { createWorld, PITCH } from './World'
import { updateAI } from './AI'
import { resolveCombat } from './Combat'
import { buildLineup } from './teamSelection'
import { chooseAutoControlledPlayerIndex, nextControlledPlayerIndex } from './playerControl'

/* ═══════════════════════════════════════════════════════════════════════
   Game — main orchestrator  (3v3 with optional local 2-player)
   ═══════════════════════════════════════════════════════════════════════ */

/** Starting positions 3v3 */
const CENTER_X = Math.round(PITCH.length * 0.12)
const WING_X = Math.round(PITCH.length * 0.3)
const WING_Z = Math.round(PITCH.width * 0.2)

const TEAM_A_POS = [
  new THREE.Vector3(-CENTER_X, 0, 0),
  new THREE.Vector3(-WING_X, 0, -WING_Z),
  new THREE.Vector3(-WING_X, 0, WING_Z),
]

const TEAM_B_POS = [
  new THREE.Vector3(CENTER_X, 0, 0),
  new THREE.Vector3(WING_X, 0, -WING_Z),
  new THREE.Vector3(WING_X, 0, WING_Z),
]

export interface GameConfig {
  /** If true, index 0 of Team B is also controlled by a human (P2) */
  localTwoPlayer?: boolean
  teamASelection?: number
  teamBSelection?: number
  autoplay?: boolean
  autoStartKickoff?: boolean
  matchConfig?: MatchConfig
}

export class Game {
  private readonly container: HTMLElement
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene: THREE.Scene
  private readonly camera: THREE.PerspectiveCamera
  private readonly clock = new THREE.Clock()
  private readonly input = new Input()

  private readonly players: Player[] = []
  private readonly teamA: Player[] = []
  private readonly teamB: Player[] = []
  private readonly ball: Ball
  private readonly match: Match
  private readonly hud: HUD

  private humanP1!: Player
  private humanP1Index = 0
  private humanP2: Player | null = null
  private readonly localTwoPlayer: boolean
  private readonly teamASelection: number
  private readonly teamBSelection: number
  private readonly autoplay: boolean
  private readonly autoStartKickoff: boolean
  private hasAutoStartedKickoff = false
  private readonly matchConfig: MatchConfig | undefined

  // Camera
  private cameraAngle  = 0
  private cameraDist   = Math.max(24, PITCH.halfLength * 0.9)
  private cameraHeight = Math.max(17, PITCH.halfLength * 0.65)
  private camSmooth    = 0.06

  constructor(container: HTMLElement, config: GameConfig = {}) {
    this.container      = container
    this.localTwoPlayer = config.localTwoPlayer ?? false
    this.teamASelection = config.teamASelection ?? 0
    this.teamBSelection = config.teamBSelection ?? 7
    this.autoplay = config.autoplay ?? false
    this.autoStartKickoff = config.autoStartKickoff ?? false
    this.matchConfig = config.matchConfig

    // Scene
    this.scene = new THREE.Scene()
    createWorld(this.scene)

    // Camera
    this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 250)

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.15
    container.appendChild(this.renderer.domElement)

    // Ball
    this.ball = new Ball()
    this.scene.add(this.ball.mesh)

    // Players
    this.createPlayers()

    // Match
    this.match = new Match(this.matchConfig)

    // HUD
    this.hud = new HUD(this.localTwoPlayer)

    // Events
    window.addEventListener('resize', this.onResize)
    window.addEventListener('wheel', this.onWheel, { passive: true })

    this.onResize()
    this.updateCamera(true)
  }

  private createPlayers(): void {
    const teamALineup = buildLineup(this.teamASelection)
    const teamBLineup = buildLineup(this.teamBSelection)

    TEAM_A_POS.forEach((pos, i) => {
      const p = new Player({
        team: 'A',
        index: i,
        isHuman: i === 0,
        startPosition: pos,
        archetype: teamALineup[i]
      })
      this.players.push(p)
      this.teamA.push(p)
      this.scene.add(p.group)
      if (i === 0) this.humanP1 = p
    })

    this.updateControlledPlayerMarkers()

    TEAM_B_POS.forEach((pos, i) => {
      const isP2 = i === 0 && this.localTwoPlayer
      const p = new Player({
        team: 'B',
        index: i,
        isHuman: false,
        isHuman2: isP2,
        startPosition: pos,
        archetype: teamBLineup[i]
      })
      this.players.push(p)
      this.teamB.push(p)
      this.scene.add(p.group)
      if (isP2) this.humanP2 = p
    })

    this.updateControlledPlayerMarkers()
  }

  start(): void {
    this.renderer.setAnimationLoop(this.loop)
  }

  destroy(): void {
    this.renderer.setAnimationLoop(null)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('wheel', this.onWheel)
    this.renderer.dispose()
  }

  /* ───────────────────────── Game Loop ───────────────────────────── */

  private readonly loop = (): void => {
    const delta = Math.min(this.clock.getDelta(), 0.05)

    if (this.input.wasPressed('escape')) {
      const pauseEvents = this.match.togglePause()
      this.handleMatchEvents(pauseEvents)
    }

    if (!this.localTwoPlayer && this.input.wasPressed('tab')) {
      this.cycleControlledPlayer()
    }

    // 1. Match state
    const events = this.match.update(delta)
    this.handleMatchEvents(events)

    // 2. Waiting to start
    if (this.match.phase === MatchPhase.WaitingToStart) {
      const shouldAutoKickoff = this.autoStartKickoff && !this.hasAutoStartedKickoff
      if (shouldAutoKickoff || this.input.wasPressed(' ', 'space', 'enter')) {
        if (shouldAutoKickoff) this.hasAutoStartedKickoff = true
        this.match.startMatch()
        this.resetPositions()
        this.ball.resetToCenter()
      }
    }

    // 3. Full time restart
    if (this.match.phase === MatchPhase.FullTime) {
      if (this.input.wasPressed(' ', 'space', 'enter')) {
        this.match.restartAfterFullTime()
        this.hasAutoStartedKickoff = false
        this.resetPositions()
        this.ball.resetToCenter()
      }
    }

    if (this.match.phase === MatchPhase.Paused) {
      this.handlePauseMenuInput()
    }

    // 4. In-play
    if (this.isActivePlayPhase()) {
      this.syncSinglePlayerControl()
      if (!this.autoplay) {
        this.handleHumanInput(this.humanP1, P1_BINDINGS)
        if (this.humanP2) this.handleHumanInput(this.humanP2, P2_BINDINGS)
      }
      this.updateAllAI(delta, this.autoplay)
      this.updateAllPlayers(delta)
      this.ball.update(delta)
      this.checkGoal()

      // Combat
      const combatResults = resolveCombat(this.players, this.ball)
      let penaltyAwarded = false
      for (const r of combatResults) {
        if (!r.foul) continue
        const awardedTeam = r.victim.team
        if (!penaltyAwarded && this.isInsidePenaltyArea(awardedTeam, r.victim.position)) {
          this.match.registerPenaltyGoal(awardedTeam)
          this.hud.showCallout('PENALTY!\nAUTO GOAL', 1900)
          penaltyAwarded = true
          continue
        }
        this.hud.showCallout('FOUL!', 1500)
      }
    }

    // 5. Camera
    this.updateCamera(false)

    // 6. HUD
    this.hud.update(
      this.match,
      this.ball.possessionTeam,
      this.humanP1,
      this.humanP2
    )

    // 7. Render
    this.renderer.render(this.scene, this.camera)

    // 8. Clear input frame
    this.input.endFrame()
  }

  /* ─────────────────────── Human Input ────────────────────────── */

  private handleHumanInput(p: Player, binds: typeof P1_BINDINGS): void {
    if (p.isActionLocked) return

    // Movement
    const dx = Number(this.input.isDown(...binds.right)) - Number(this.input.isDown(...binds.left))
    const dz = Number(this.input.isDown(...binds.down))  - Number(this.input.isDown(...binds.up))
    p.moveDir.set(dx, 0, dz)
    p.sprinting = this.input.isDown(...binds.sprint)

    // Turbo dash
    if (this.input.wasPressed(...binds.dash)) {
      p.triggerDash()
    }

    // Pass
    if (this.input.wasPressed(...binds.pass) && p.hasBall) {
      const target = this.findBestPassTarget(p)
      const dir = target
        ? target.position.clone().sub(p.position)
        : p.facingDir
      dir.y = 0
      this.ball.releaseAsPass(dir)
    }

    // Shoot
    if (this.input.wasPressed(...binds.shoot) && p.hasBall) {
      const goalX = p.team === 'A' ? PITCH.halfLength : -PITCH.halfLength
      const shootDir = new THREE.Vector3(goalX, 0, p.position.z * 0.25).sub(p.position)
      this.ball.releaseAsShot(shootDir)
    }

    // Tackle
    if (this.input.wasPressed(...binds.tackle)) {
      p.triggerTackle()
    }
  }

  private findBestPassTarget(passer: Player): Player | null {
    const teammates = passer.team === 'A' ? this.teamA : this.teamB
    let best: Player | null = null
    let bestScore = -Infinity

    for (const t of teammates) {
      if (t === passer || t.isActionLocked) continue
      const dir = t.position.clone().sub(passer.position)
      dir.y = 0
      const dist = dir.length()
      if (dist < 3 || dist > 35) continue
      const dot = passer.facingDir.dot(dir.normalize())
      const score = dot * 10 - dist * 0.2
      if (score > bestScore) { bestScore = score; best = t }
    }
    return best
  }

  private handlePauseMenuInput(): void {
    if (this.input.wasPressed('w', 'arrowup')) {
      this.hud.movePauseSelection(-1)
    }

    if (this.input.wasPressed('s', 'arrowdown')) {
      this.hud.movePauseSelection(1)
    }

    if (this.input.wasPressed('enter', ' ', 'space')) {
      const action = this.hud.getPauseSelectionAction()
      this.executePauseAction(action)
    }
  }

  private executePauseAction(action: PauseMenuAction): void {
    switch (action) {
      case 'resume': {
        const resumeEvents = this.match.togglePause()
        this.handleMatchEvents(resumeEvents)
        break
      }
      case 'restart': {
        this.match.restartAfterFullTime()
        this.match.startMatch()
        this.resetPositions()
        this.ball.resetToCenter()
        this.hud.hidePauseOverlay()
        this.hud.showCallout('RESTART', 900)
        break
      }
      case 'setup': {
        window.location.reload()
        break
      }
    }
  }

  private syncSinglePlayerControl(): void {
    if (this.localTwoPlayer || this.autoplay) return

    const autoIndex = chooseAutoControlledPlayerIndex(
      this.teamA.map((player) => ({
        x: player.position.x,
        z: player.position.z,
        hasBall: player.hasBall,
      })),
      { x: this.ball.position.x, z: this.ball.position.z },
      this.humanP1Index,
    )

    if (autoIndex !== this.humanP1Index && this.teamA[autoIndex]?.hasBall) {
      this.setControlledPlayer(autoIndex, false)
    }
  }

  private cycleControlledPlayer(): void {
    const nextIndex = nextControlledPlayerIndex(this.humanP1Index, this.teamA.length)
    this.setControlledPlayer(nextIndex, true)
  }

  private setControlledPlayer(index: number, announce: boolean): void {
    if (!this.teamA[index]) return
    this.humanP1Index = index
    this.humanP1 = this.teamA[index]
    this.updateControlledPlayerMarkers()
    if (announce) this.hud.showCallout(`CONTROL\n${this.humanP1.displayName}`, 900)
  }

  private updateControlledPlayerMarkers(): void {
    this.teamA.forEach((player, index) => {
      player.setControlled(index === this.humanP1Index, 'primary')
    })

    if (this.humanP2) {
      this.humanP2.setControlled(true, 'secondary')
    }
  }

  /* ─────────────────────── AI Update ────────────────────────── */

  private updateAllAI(delta: number, includeHumanControlled = false): void {
    for (const p of this.players) {
      // Skip currently human-controlled players
      if (!includeHumanControlled && (p === this.humanP1 || p === this.humanP2)) continue
      const teammates = p.team === 'A' ? this.teamA : this.teamB
      const opponents = p.team === 'A' ? this.teamB : this.teamA
      updateAI(p, this.ball, teammates.filter(t => t !== p), opponents, delta)
    }
  }

  /* ─────────────────────── Player Updates ────────────────────────── */

  private updateAllPlayers(delta: number): void {
    for (const p of this.players) {
      p.update(delta, this.ball)
    }
  }

  /* ─────────────────────── Goal Check ────────────────────────── */

  private checkGoal(): void {
    if (this.ball.state === BallState.GoalScored && this.ball.scoredSide !== 0) {
      this.match.registerGoal(this.ball.scoredSide)
      const scorer = this.ball.scoredSide > 0 ? '🔵 BLUE' : '🔴 RED'
      this.hud.showCallout(`⚽ GOAL!\n${scorer}!`, 2800)
    }
  }

  /* ─────────────────────── Match Events ────────────────────────── */

  private handleMatchEvents(events: MatchEvent[]): void {
    for (const e of events) {
      switch (e) {
        case 'kickoff':   break
        case 'restart':
          this.resetPositions()
          this.ball.resetToCenter()
          break
        case 'halftime':
          this.hud.showCallout('HALF TIME', 3000)
          break
        case 'secondhalf':
          this.swapSides()
          this.ball.resetToCenter()
          this.hud.showCallout('2ND HALF', 2000)
          break
        case 'overtime':
          this.resetPositions()
          this.ball.resetToCenter()
          this.hud.showCallout('OVERTIME', 2200)
          break
        case 'suddendeath':
          this.resetPositions()
          this.ball.resetToCenter()
          this.hud.showCallout('SUDDEN DEATH', 2200)
          break
        case 'fulltime':
          this.hud.showFullTimeOverlay(this.match.scoreA, this.match.scoreB)
          break
        case 'paused':
          this.hud.showPauseOverlay()
          this.hud.showCallout('PAUSED', 1_000_000)
          break
        case 'resumed':
          this.hud.hidePauseOverlay()
          this.hud.showCallout('PLAY', 800)
          break
      }
    }
  }

  private resetPositions(): void {
    for (const p of this.players) p.resetToStart()
  }

  private swapSides(): void {
    for (const p of this.players) {
      const m = p.position.clone()
      m.x *= -1
      p.resetToPosition(m)
    }
  }

  private isActivePlayPhase(): boolean {
    return (
      this.match.phase === MatchPhase.InPlay ||
      this.match.phase === MatchPhase.Overtime ||
      this.match.phase === MatchPhase.SuddenDeath
    )
  }

  private isInsidePenaltyArea(defendingTeam: 'A' | 'B', position: THREE.Vector3): boolean {
    const xMin = -PITCH.halfLength
    const xMax = PITCH.halfLength
    const inZ = Math.abs(position.z) <= PITCH.penaltyAreaWidth / 2
    if (!inZ) return false

    if (defendingTeam === 'A') {
      return position.x <= xMin + PITCH.penaltyAreaLength
    }

    return position.x >= xMax - PITCH.penaltyAreaLength
  }

  /* ─────────────────────── Camera ────────────────────────── */

  private updateCamera(snap: boolean): void {
    // Follow ball, slight look-ahead toward goal
    const bpos = this.ball.position.clone()
    const target = bpos.clone()
    target.x = THREE.MathUtils.clamp(target.x, -PITCH.halfLength * 0.7, PITCH.halfLength * 0.7)
    target.y = 1

    const offset = new THREE.Vector3(
      Math.sin(this.cameraAngle) * this.cameraDist,
      this.cameraHeight,
      Math.cos(this.cameraAngle) * this.cameraDist
    )
    const desired = target.clone().add(offset)

    if (snap) {
      this.camera.position.copy(desired)
    } else {
      this.camera.position.lerp(desired, this.camSmooth)
    }

    const look = target.clone()
    look.y = 0.5
    this.camera.lookAt(look)
  }

  /* ─────────────────────── Resize / Wheel ────────────────────────── */

  private readonly onResize = (): void => {
    const w = this.container.clientWidth  || window.innerWidth
    const h = this.container.clientHeight || window.innerHeight
    if (w === 0 || h === 0) return
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  private readonly onWheel = (e: WheelEvent): void => {
    this.cameraDist = THREE.MathUtils.clamp(this.cameraDist + e.deltaY * 0.025, 14, 56)
    this.cameraHeight = this.cameraDist * 0.72
  }
}
