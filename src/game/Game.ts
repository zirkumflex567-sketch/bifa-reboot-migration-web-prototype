import * as THREE from 'three'
import { Input, P1_BINDINGS, P2_BINDINGS } from './Input'
import { Player, Team } from './Player'
import { Ball, BallState } from './Ball'
import { Match, MatchPhase } from './Match'
import type { MatchConfig } from './Match'
import type { MatchEvent } from './Match'
import { HUD } from './HUD'
import type { PauseMenuAction } from './HUD'
import { createWorld, PITCH } from './World'
import { VFXManager } from './VFXManager'
import { ChaosManager } from './ChaosManager'
import { updateAI } from './AI'
import { resolveCombat } from './Combat'
import { buildLineup } from './teamSelection'
import { updateStadiumScreen } from './World'
import { NetworkManager } from './NetworkManager'
import { chooseAutoControlledPlayerIndex, nextControlledPlayerIndex } from './playerControl'

/* ═══════════════════════════════════════════════════════════════════════
   Game — main orchestrator  (3v3 with optional local 2-player)
   ═══════════════════════════════════════════════════════════════════════ */

const CENTER_X = Math.round(PITCH.length * 0.12)
const WING_X = Math.round(PITCH.length * 0.3)
const WING_Z = Math.round(PITCH.width * 0.2)

const TEAM_A_POS = [
  new THREE.Vector3(-CENTER_X, 0, 0),
  new THREE.Vector3(-WING_X, 0, -WING_Z),
  new THREE.Vector3(-WING_X, 0, WING_Z),
  new THREE.Vector3(-(CENTER_X + 10), 0, 0), // Sweeper/Defender
]

const TEAM_B_POS = [
  new THREE.Vector3(CENTER_X, 0, 0),
  new THREE.Vector3(WING_X, 0, -WING_Z),
  new THREE.Vector3(WING_X, 0, WING_Z),
  new THREE.Vector3(CENTER_X + 10, 0, 0),
]

export interface GameConfig {
  localTwoPlayer?: boolean
  teamASelection?: number
  teamBSelection?: number
  autoplay?: boolean
  autoStartKickoff?: boolean
  localFourPlayer?: boolean
  matchConfig?: MatchConfig
}

export class Game {
  private readonly container: HTMLElement
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene: THREE.Scene
  private readonly camera: THREE.PerspectiveCamera
  private readonly clock = new THREE.Clock()
  readonly input = new Input()
  readonly network = new NetworkManager()

  private readonly players: Player[] = []
  private readonly teamA: Player[] = []
  private readonly teamB: Player[] = []
  private readonly ball: Ball
  private readonly match: Match
  private readonly hud: HUD
  private readonly vfx: VFXManager
  private readonly chaos: ChaosManager
  private readonly gameState: any // GameState from archetypes
  private switchLockTimer = 0
  private readonly switchLockDuration = 0.5
  private penaltyTimer = 0
  private penaltyAiming = 0

  private humanP1!: Player
  private humanP1Index = 0
  private humanP2: Player | null = null
  private readonly localTwoPlayer: boolean
  private readonly localFourPlayer: boolean
  private readonly teamASelection: number
  private readonly teamBSelection: number
  private readonly autoplay: boolean
  private readonly autoStartKickoff: boolean
  private hasAutoStartedKickoff = false
  private autoRestartTimer = 0
  private readonly autoRestartDelay = 4
  private readonly matchConfig: MatchConfig | undefined

  private cameraAngle  = 0
  private cameraDist   = Math.max(24, PITCH.halfLength * 0.9)
  private cameraHeight = Math.max(17, PITCH.halfLength * 0.65)
  private camSmooth    = 0.06

  constructor(container: HTMLElement, config: GameConfig = {}) {
    this.container      = container
    this.localTwoPlayer = config.localTwoPlayer ?? false
    this.localFourPlayer = config.localFourPlayer ?? false
    this.teamASelection = config.teamASelection ?? 0
    this.teamBSelection = config.teamBSelection ?? 7
    this.autoplay = config.autoplay ?? false
    this.autoStartKickoff = config.autoStartKickoff ?? false
    this.matchConfig = config.matchConfig

    this.scene = new THREE.Scene()
    createWorld(this.scene)

    this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 250)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.15
    container.appendChild(this.renderer.domElement)

    this.ball = new Ball()
    this.scene.add(this.ball.mesh)

    this.createPlayers()
    this.match = new Match(this.matchConfig)
    this.hud = new HUD(this.localTwoPlayer)
    this.vfx = new VFXManager(this.scene)
    this.gameState = {
      chaosDoubleScore: false,
      chaosBallSpeed: 1,
      chaosFriction: 1,
      chaosMeterMult: 1,
      chaosBallScale: 1,
      chaosPlayerScale: 1,
      chaosSpeedMult: 1,
      chaosGlassCannon: false,
      goalCelebTimer: 0,
      prevPossTeam: null
    }
    this.chaos = new ChaosManager(this.gameState, (name) => {
      this.hud.showCallout(`CHAOS UNLEASHED\n${name}`, 3000)
      updateStadiumScreen('CHAOS ALERT', name)
    })

    window.addEventListener('resize', this.onResize)
    window.addEventListener('wheel', this.onWheel, { passive: true })

    this.onResize()
    
    // Initial Camera Position for Fly-in
    this.camera.position.set(0, 80, 100)
    this.camera.lookAt(0, 0, 0)
  }

  private createPlayers(): void {
    const teamALineup = buildLineup(this.teamASelection)
    const teamBLineup = buildLineup(this.teamBSelection)

    const localCount = this.localFourPlayer ? 4 : 1
    TEAM_A_POS.forEach((pos, i) => {
      const isHuman = i < localCount
      const p = new Player({
        team: 'A',
        index: i,
        isHuman: isHuman,
        startPosition: pos,
        archetype: teamALineup[i]
      })
      this.players.push(p)
      this.teamA.push(p)
      this.scene.add(p.group)
      if (i === 0) this.humanP1 = p
    })

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
    this.playStartAnimation()
  }

  private playStartAnimation(): void {
    const duration = 2.5
    let elapsed = 0
    
    const startPos = new THREE.Vector3(0, 80, 100)
    const endPos = new THREE.Vector3(
      Math.sin(this.cameraAngle) * this.cameraDist, 
      this.cameraHeight, 
      Math.cos(this.cameraAngle) * this.cameraDist
    ).add(this.ball.position)

    const anim = () => {
      elapsed += this.clock.getDelta()
      const t = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3) // Cubic ease-out
      
      this.camera.position.lerpVectors(startPos, endPos, ease)
      this.camera.lookAt(this.ball.position.x, 0.5, this.ball.position.z)
      
      if (t < 1) requestAnimationFrame(anim)
    }
    anim()
  }

  destroy(): void {
    this.renderer.setAnimationLoop(null)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('wheel', this.onWheel)
    this.renderer.dispose()
  }

  private readonly loop = (): void => {
    const delta = Math.min(this.clock.getDelta(), 0.05)

    if (this.input.wasPressed('escape')) {
      const pauseEvents = this.match.togglePause()
      this.handleMatchEvents(pauseEvents)
    }

    if (!this.localTwoPlayer && this.input.wasPressed('tab')) {
      this.cycleControlledPlayer()
    }

    const events = this.match.update(delta)
    this.handleMatchEvents(events)

    // ONLINE SYNC
    if (this.network.isConnected && this.network.state) {
      this.syncWithServer(this.network.state)
      this.sendInputsToServer()
    }

    if (this.match.phase === MatchPhase.WaitingToStart) {
      const shouldAutoKickoff = this.autoStartKickoff && !this.hasAutoStartedKickoff
      if (shouldAutoKickoff || this.input.wasPressed(' ', 'space', 'enter')) {
        if (shouldAutoKickoff) this.hasAutoStartedKickoff = true
        this.match.startMatch()
        this.resetPositions()
        this.ball.resetToCenter()
        updateStadiumScreen('REDLINE FC', 'MATCH START')
      }
    }

    if (this.match.phase === MatchPhase.FullTime) {
      this.hud.showFullTimeOverlay(this.match, this.humanP1) // Human P1 as default MVP for now
      
      if (this.autoplay) {
        this.autoRestartTimer -= delta
        if (this.autoRestartTimer <= 0) {
          this.match.restartAfterFullTime()
          this.match.startMatch()
          this.hasAutoStartedKickoff = false
          this.resetPositions()
          this.ball.resetToCenter()
          this.hud.showCallout('NEXT MATCH', 1200)
        }
      } else if (this.input.wasPressed(' ', 'space', 'enter')) {
        this.match.restartAfterFullTime()
        this.hasAutoStartedKickoff = false
        this.resetPositions()
        this.ball.resetToCenter()
      }
    }

    if (this.match.phase === MatchPhase.Paused) {
      this.handlePauseMenuInput()
    }

    if (this.isActivePlayPhase()) {
      this.switchLockTimer = Math.max(0, this.switchLockTimer - delta)
      this.syncSinglePlayerControl()
      if (!this.autoplay) {
        this.handleHumanInput(this.humanP1, P1_BINDINGS)
        if (this.humanP2) this.handleHumanInput(this.humanP2, P2_BINDINGS)
      }
      this.updateAllAI(delta, this.autoplay)
      this.updateAllPlayers(delta)
      this.ball.update(delta)
      this.checkGoal()
      this.updateSwitchPreview()

      const combatResults = resolveCombat(this.players, this.ball)
      let penaltyAwarded = false
      for (const r of combatResults) {
        // Record Tackle
        if (r.attacker.team === 'A') this.match.statsA.tackles++
        else this.match.statsB.tackles++

        if (r.knockdown) {
          if (r.victim.team === 'A') this.match.statsA.integrityLost += 15
          else this.match.statsB.integrityLost += 15
        }

        const awardedTeam = r.attacker.team
        if (!penaltyAwarded && this.isInsidePenaltyArea(awardedTeam, r.victim.position)) {
          this.initiatePenaltyEvent(awardedTeam)
          penaltyAwarded = true
          continue
        }
        this.vfx.emitBurst(r.victim.position, 0xff0055, 45) // Hard hit magenta burst
        this.hud.showCallout('HARD HIT!', 1500)
      }
    } else if (this.match.phase === MatchPhase.PenaltyEvent) {
      this.updatePenaltyLogic(delta)
    }

    this.updateCamera(false)
    this.vfx.update(delta)
    this.chaos.update(delta)
    
    // Auto-announce chaos if just changed
    const currentChaos = this.chaos.getCurrentModName()
    if (currentChaos && this.match.phase === MatchPhase.InPlay) {
      // We could use a tracker to only show it once
    }

    this.hud.update(
      this.match,
      this.ball.possessionTeam,
      this.humanP1,
      this.humanP2
    )

    this.renderer.render(this.scene, this.camera)
    this.input.endFrame()
  }

  /* ─────────────────────── Human Input ────────────────────────── */

  private handleHumanInput(p: Player, binds: typeof P1_BINDINGS): void {
    if (p.isActionLocked) return

    const { moveX, moveY, buttons, sprint } = this.input.getUnified(p.index, binds)
    
    p.moveDir.set(moveX, 0, moveY)
    p.sprinting = sprint
    
    if (buttons.has('dash')) p.triggerDash()

    if (buttons.has('shoot') && p.hasBall) {
      const aim = p.facingDir.clone()
      this.ball.releaseAsShot(aim)
      if (p.team === 'A') this.match.statsA.shots++
      else this.match.statsB.shots++
      try { navigator.vibrate(40) } catch {}
    }

    if (buttons.has('pass') && p.hasBall) {
      const target = this.findBestPassTarget(p)
      const dir = target ? target.position.clone().sub(p.position) : p.facingDir
      dir.y = 0
      
      if (p.specialActive && p.archetype?.special === 'laserPass') {
        this.ball.releaseAsPass(dir, 1.8) 
        p.triggerSpecial(() => {})
      } else {
        this.ball.releaseAsPass(dir)
      }
    }

    if (this.input.wasPressed(...binds.tackle)) {
      p.triggerTackle()
    }

    if (buttons.has('special') && p.specialMeter >= 100) {
      p.triggerSpecial(() => {
        try { navigator.vibrate([30, 50, 30]) } catch {}
      })
      if (p.team === 'A') this.match.statsA.specials++
      else this.match.statsB.specials++
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
    if (this.input.wasPressed('w', 'arrowup')) this.hud.movePauseSelection(-1)
    if (this.input.wasPressed('s', 'arrowdown')) this.hud.movePauseSelection(1)
    if (this.input.wasPressed('enter', ' ', 'space')) {
      const action = this.hud.getPauseSelectionAction()
      this.executePauseAction(action)
    }
  }

  private executePauseAction(action: PauseMenuAction): void {
    switch (action) {
      case 'resume':
        const resumeEvents = this.match.togglePause()
        this.handleMatchEvents(resumeEvents)
        break
      case 'restart':
        this.match.restartAfterFullTime()
        this.match.startMatch()
        this.resetPositions()
        this.ball.resetToCenter()
        this.hud.hidePauseOverlay()
        this.hud.showCallout('RESTART', 900)
        break
      case 'setup':
        window.location.reload()
        break
    }
  }

  private syncSinglePlayerControl(): void {
    if (this.localTwoPlayer || this.autoplay) return

    if (this.switchLockTimer > 0) return

    const autoIndex = chooseAutoControlledPlayerIndex(
      this.teamA.map((p) => ({
        x: p.position.x,
        z: p.position.z,
        vx: p.velocity.x,
        vz: p.velocity.z,
        hasBall: p.hasBall,
        team: p.team,
        isActionLocked: p.isActionLocked
      })),
      {
        x: this.ball.position.x,
        z: this.ball.position.z,
        vx: this.ball.velocity.x,
        vz: this.ball.velocity.z
      },
      this.humanP1Index,
      -PITCH.halfLength // Own goal X for Team A
    )

    // Only auto-switch if the new candidate has the ball or is way better
    if (autoIndex !== this.humanP1Index && this.teamA[autoIndex]?.hasBall) {
      this.setControlledPlayer(autoIndex, false)
    }
  }

  private syncWithServer(state: any): void {
    // Smoothly interpolate players
    for (const id in state.players) {
      const sp = state.players[id]
      // Find local player by name or index (simplified for prototype)
      const localP = this.players.find(p => p.index === Object.keys(state.players).indexOf(id))
      if (localP) {
        localP.group.position.x += (sp.x - localP.group.position.x) * 0.4
        localP.group.position.z += (sp.z - localP.group.position.z) * 0.4
        localP.hasBall = sp.hasBall
      }
    }
    // Interpolate Ball
    this.ball.position.x += (state.ball.x - this.ball.position.x) * 0.5
    this.ball.position.z += (state.ball.z - this.ball.position.z) * 0.5
  }

  private sendInputsToServer(): void {
    const p = this.humanP1
    if (!p) return
    const unified = this.input.getUnified(0, P1_BINDINGS)
    
    this.network.sendInput({
      moveX: unified.moveX,
      moveY: unified.moveY,
      sprint: unified.sprint,
      dash: unified.buttons.has('dash'),
      pass: unified.buttons.has('pass'),
      shoot: unified.buttons.has('shoot')
    })
  }

  private updateSwitchPreview(): void {
    if (this.localTwoPlayer || this.autoplay) return

    const bestIndex = chooseAutoControlledPlayerIndex(
      this.teamA.map((p) => ({
        x: p.position.x,
        z: p.position.z,
        vx: p.velocity.x,
        vz: p.velocity.z,
        hasBall: p.hasBall,
        team: p.team,
        isActionLocked: p.isActionLocked
      })),
      {
        x: this.ball.position.x,
        z: this.ball.position.z,
        vx: this.ball.velocity.x,
        vz: this.ball.velocity.z
      },
      this.humanP1Index,
      -PITCH.halfLength
    )

    this.teamA.forEach((p, idx) => {
      p.setNextTarget(idx === bestIndex && idx !== this.humanP1Index)
    })
  }

  private cycleControlledPlayer(): void {
    const nextIndex = chooseAutoControlledPlayerIndex(
      this.teamA.map((p) => ({
        x: p.position.x,
        z: p.position.z,
        vx: p.velocity.x,
        vz: p.velocity.z,
        hasBall: p.hasBall,
        team: p.team,
        isActionLocked: p.isActionLocked
      })),
      {
        x: this.ball.position.x,
        z: this.ball.position.z,
        vx: this.ball.velocity.x,
        vz: this.ball.velocity.z
      },
      this.humanP1Index,
      -PITCH.halfLength
    )
    
    // If weighted logic doesn't give a new one, fallback to cycle
    const finalIndex = nextIndex === this.humanP1Index 
      ? nextControlledPlayerIndex(this.humanP1Index, this.teamA.length)
      : nextIndex

    this.setControlledPlayer(finalIndex, true)
    this.switchLockTimer = this.switchLockDuration
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
    if (this.humanP2) this.humanP2.setControlled(true, 'secondary')
  }

  private updateAllAI(delta: number, includeHumanControlled = false): void {
    for (const p of this.players) {
      if (!includeHumanControlled && (p === this.humanP1 || p === this.humanP2)) continue
      const teammates = p.team === 'A' ? this.teamA : this.teamB
      const opponents = p.team === 'A' ? this.teamB : this.teamA
      updateAI(p, this.ball, teammates.filter(t => t !== p), opponents, delta)
    }
  }

  private updateAllPlayers(delta: number): void {
    for (const p of this.players) {
      p.update(delta, this.ball)
      if (p.isDashing) {
        this.vfx.emitTrail(p.position, p.team === 'A' ? 0x00f2ff : 0xff0055)
      }
    }
  }

  private checkGoal(): void {
    if (this.ball.state === BallState.GoalScored && this.ball.scoredSide !== 0) {
      this.match.registerGoal(this.ball.scoredSide)
      const scorer = this.ball.scoredSide > 0 ? '🔵 BLUE' : '🔴 RED'
      const color = this.ball.scoredSide > 0 ? 0x00f2ff : 0xff0055
      this.vfx.emitBurst(this.ball.position, color, 40)
      this.hud.showCallout(`⚽ GOAL!\n${scorer}!`, 2800)
      updateStadiumScreen('GOAL SCORED', scorer)
    }
  }

  private handleMatchEvents(events: MatchEvent[]): void {
    for (const e of events) {
      switch (e) {
        case 'kickoff': break
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
          if (this.autoplay) this.autoRestartTimer = this.autoRestartDelay
          this.hud.showFullTimeOverlay(this.match, this.humanP1)
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

  private initiatePenaltyEvent(awardedTeam: Team): void {
    this.match.phase = MatchPhase.PenaltyEvent
    this.hud.showCallout('PENALTY!', 3000)
    updateStadiumScreen('PENALTY', 'SHIELD DOWN')

    const attackingSide = awardedTeam === 'A' ? 1 : -1
    const spotX = attackingSide * (PITCH.halfLength - 11)
    const goalX = attackingSide * PITCH.halfLength

    this.ball.forceRelease()
    this.ball.position.set(spotX, 0.28, 0)
    this.ball.velocity.set(0, 0, 0)

    // Position Kicker
    const kicker = awardedTeam === 'A' ? this.humanP1 : this.humanP2
    if (kicker) {
      kicker.position.set(spotX - attackingSide * 2, 0, 0)
      kicker.facingDir.set(attackingSide, 0, 0)
    }

    // Position Keeper
    const keeper = awardedTeam === 'A' ? this.teamB[0] : this.teamA[0]
    if (keeper) {
      keeper.position.set(goalX, 0, 0)
      keeper.facingDir.set(-attackingSide, 0, 0)
    }

    // Move others to sideline
    this.players.forEach(p => {
      if (p !== kicker && p !== keeper) {
        p.position.set(0, 0, PITCH.halfWidth + 5)
      }
    })

    this.penaltyTimer = 4.0
    this.updateCamera(true)
  }

  private updatePenaltyLogic(delta: number): void {
    const overlay = document.getElementById('penalty-overlay')
    const indicator = document.getElementById('aim-indicator')
    if (overlay) overlay.classList.remove('hidden')

    this.penaltyTimer -= delta
    
    // Aiming pulse logic
    this.penaltyAiming = Math.sin(Date.now() * 0.005) // Oscillates -1 to 1
    if (indicator) {
      indicator.style.left = `${50 + this.penaltyAiming * 45}%`
    }

    const attackingTeam = this.match.lastScorer === 'A' ? 'B' : 'A' // Team that suffered the foul
    const binds = attackingTeam === 'A' ? P1_BINDINGS : P2_BINDINGS

    if (this.input.wasPressed(...binds.shoot) || this.input.wasPressed(' ', 'space')) {
      this.executePenaltyKick()
    }

    if (this.penaltyTimer <= 0) {
      this.executePenaltyKick()
    }
  }

  private executePenaltyKick(): void {
    const overlay = document.getElementById('penalty-overlay')
    if (overlay) overlay.classList.add('hidden')

    const attackingTeam = this.match.lastScorer === 'A' ? 'B' : 'A'
    const attackingSide = attackingTeam === 'A' ? 1 : -1

    // Simulation: Keeper dives randomly for now
    const keeperDive = (Math.random() - 0.5) * 2 // -1 to 1
    const aim = this.penaltyAiming 
    const success = Math.abs(aim - keeperDive) > 0.4

    const shootDir = new THREE.Vector3(attackingSide, 0, aim * 0.4).normalize()
    this.ball.releaseAsShot(shootDir, 1.8)
    
    this.hud.showCallout(success ? 'GOAL!' : 'SAVED!', 2000)
    
    // Resume match after delay
    setTimeout(() => {
      if (success) {
        this.match.registerGoal(attackingSide as -1 | 1)
      } else {
        this.match.phase = MatchPhase.InPlay
        this.ball.velocity.set(-attackingSide * 10, 0, (Math.random()-0.5)*10)
      }
    }, 1500)
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
    if (defendingTeam === 'A') return position.x <= xMin + PITCH.penaltyAreaLength
    return position.x >= xMax - PITCH.penaltyAreaLength
  }

  private updateCamera(snap: boolean): void {
    let target: THREE.Vector3
    
    if (this.match.phase === MatchPhase.PenaltyEvent) {
      // Cinematic zoom on goal/spot
      const attackingSide = this.ball.position.x > 0 ? 1 : -1
      target = new THREE.Vector3(attackingSide * (PITCH.halfLength - 5), 0, 0)
      this.cameraDist = 18
      this.cameraHeight = 8
    } else {
      target = this.ball.position.clone()
      target.x = THREE.MathUtils.clamp(target.x, -PITCH.halfLength * 0.7, PITCH.halfLength * 0.7)
    }
    target.y = 1
    const offset = new THREE.Vector3(Math.sin(this.cameraAngle) * this.cameraDist, this.cameraHeight, Math.cos(this.cameraAngle) * this.cameraDist)
    const desired = target.clone().add(offset)
    if (snap) this.camera.position.copy(desired)
    else this.camera.position.lerp(desired, this.camSmooth)
    const look = target.clone()
    look.y = 0.5
    this.camera.lookAt(look)
  }

  private readonly onResize = (): void => {
    const w = this.container.clientWidth || window.innerWidth
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
