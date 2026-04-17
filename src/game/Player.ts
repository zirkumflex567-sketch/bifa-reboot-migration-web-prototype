import * as THREE from 'three'
import { PITCH } from './World'
import type { Ball } from './Ball'

/* ═══════════════════════════════════════════════════════════════════════
   Player  —  capsule character with stamina & turbo dash
   ═══════════════════════════════════════════════════════════════════════ */

export type Team = 'A' | 'B'

export enum PlayerState {
  Locomotion  = 'Locomotion',
  Tackle      = 'Tackle',
  Dash        = 'Dash',
  Stunned     = 'Stunned',
  KnockedDown = 'KnockedDown',
  Recovering  = 'Recovering'
}

export interface PlayerConfig {
  team: Team
  index: number
  isHuman: boolean
  startPosition: THREE.Vector3
  /** true = second local human player (IJKL controls) */
  isHuman2?: boolean
}

const TEAM_COLORS: Record<Team, number>  = { A: 0x3b8bff, B: 0xff4444 }
const TEAM_GLOW:   Record<Team, number>  = { A: 0x88ccff, B: 0xff8888 }

// Movement
const BASE_SPEED        = 7.0
const SPRINT_SPEED      = 10.5
const CARRIER_PENALTY   = 0.82

// Tackle
const TACKLE_DASH       = 14
const TACKLE_DURATION   = 0.30
const STUN_DURATION     = 0.55
const KNOCKDOWN_DUR     = 1.0
const RECOVER_DUR       = 0.35
const TACKLE_COOLDOWN   = 0.85

// Stamina
const STAMINA_MAX       = 100
const STAMINA_SPRINT    = 18   // drain per second when sprinting
const STAMINA_REGEN     = 22   // recover per second when not sprinting
const STAMINA_DASH_COST = 35   // flat cost per turbo dash
const STAMINA_MIN_DASH  = 36   // min stamina needed to dash

// Turbo Dash
const DASH_SPEED        = 22
const DASH_DURATION     = 0.22
const DASH_COOLDOWN     = 0.9

export class Player {
  readonly group = new THREE.Group()
  readonly team: Team
  readonly index: number
  readonly isHuman: boolean
  readonly isHuman2: boolean

  private readonly body: THREE.Mesh
  private readonly bodyMat: THREE.MeshStandardMaterial
  private readonly glowRing: THREE.Mesh
  private readonly glowMat: THREE.MeshBasicMaterial

  state = PlayerState.Locomotion
  private stateTimer = 0
  private tackleCooldown = 0
  private dashCooldown = 0
  private facing = new THREE.Vector3(1, 0, 0)

  // Stamina
  stamina = STAMINA_MAX
  isDashing = false

  hasBall = false
  private startPos: THREE.Vector3

  moveDir = new THREE.Vector3()
  sprinting = false
  dashRequested = false

  constructor(config: PlayerConfig) {
    this.team      = config.team
    this.index     = config.index
    this.isHuman   = config.isHuman
    this.isHuman2  = config.isHuman2 ?? false
    this.startPos  = config.startPosition.clone()

    const color = TEAM_COLORS[this.team]
    const glow  = TEAM_GLOW[this.team]

    // Body — Synty-style stylized capsule
    this.bodyMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.4,
      emissive: new THREE.Color(color).multiplyScalar(0.12),
    })
    this.body = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 1.0, 8, 16), this.bodyMat)
    this.body.position.y = 0.9
    this.body.castShadow = true
    this.group.add(this.body)

    // Head
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffe0c0, roughness: 0.6 })
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), headMat)
    head.position.y = 1.82
    head.castShadow = true
    this.group.add(head)

    // Jersey number (team color stripe)
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.1), stripeMat)
    stripe.position.set(0, 1.05, 0.35)
    this.group.add(stripe)

    // Glow ring (team indicator)
    this.glowMat = new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.7 })
    this.glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.055, 8, 20), this.glowMat)
    this.glowRing.rotation.x = Math.PI / 2
    this.glowRing.position.y = 1.9
    this.group.add(this.glowRing)

    // Ground shadow disc
    const shadowMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 })
    )
    shadowMesh.rotation.x = -Math.PI / 2
    shadowMesh.position.y = 0.02
    this.group.add(shadowMesh)

    // Human player indicator ring (yellow)
    if (config.isHuman || config.isHuman2) {
      const markerColor = config.isHuman ? 0xffcc00 : 0x00ffcc
      const hr = new THREE.Mesh(
        new THREE.RingGeometry(0.65, 0.78, 28),
        new THREE.MeshBasicMaterial({ color: markerColor, transparent: true, opacity: 0.75 })
      )
      hr.rotation.x = -Math.PI / 2
      hr.position.y = 0.025
      this.group.add(hr)
    }

    this.resetToPosition(config.startPosition)
  }

  get position(): THREE.Vector3 { return this.group.position }
  get facingDir(): THREE.Vector3 { return this.facing.clone() }
  get isActionLocked(): boolean { return this.state !== PlayerState.Locomotion && this.state !== PlayerState.Dash }
  get canTackle(): boolean { return this.state === PlayerState.Locomotion && this.tackleCooldown <= 0 }
  get canDash(): boolean {
    return this.state === PlayerState.Locomotion &&
           this.dashCooldown <= 0 &&
           this.stamina >= STAMINA_MIN_DASH
  }
  get staminaRatio(): number { return this.stamina / STAMINA_MAX }

  resetToPosition(pos: THREE.Vector3): void {
    this.group.position.set(pos.x, 0, pos.z)
    this.state = PlayerState.Locomotion
    this.stateTimer = 0
    this.tackleCooldown = 0
    this.dashCooldown = 0
    this.hasBall = false
    this.isDashing = false
    this.moveDir.set(0, 0, 0)
    this.facing.set(-Math.sign(pos.x) || 1, 0, 0)
  }

  resetToStart(): void { this.resetToPosition(this.startPos) }

  update(delta: number, ball: Ball): void {
    this.tackleCooldown = Math.max(0, this.tackleCooldown - delta)
    this.dashCooldown   = Math.max(0, this.dashCooldown - delta)

    // Stamina regen/drain
    this.updateStamina(delta)

    switch (this.state) {
      case PlayerState.Locomotion:
        this.tickLocomotion(delta, ball)
        break
      case PlayerState.Tackle:
        this.tickTackle(delta)
        break
      case PlayerState.Dash:
        this.tickDash(delta, ball)
        break
      case PlayerState.Stunned:
        this.tickTimed(delta, PlayerState.Recovering, RECOVER_DUR)
        break
      case PlayerState.KnockedDown:
        this.tickTimed(delta, PlayerState.Recovering, RECOVER_DUR)
        break
      case PlayerState.Recovering:
        this.tickTimed(delta, PlayerState.Locomotion, 0)
        break
    }
    this.clampPosition()
    this.updateVisuals()
  }

  private updateStamina(delta: number): void {
    if (this.isDashing) {
      // No extra drain while dashing — cost was paid upfront
    } else if (this.sprinting && this.moveDir.lengthSq() > 0.01) {
      this.stamina = Math.max(0, this.stamina - STAMINA_SPRINT * delta)
      if (this.stamina === 0) this.sprinting = false
    } else {
      this.stamina = Math.min(STAMINA_MAX, this.stamina + STAMINA_REGEN * delta)
    }
  }

  private tickLocomotion(delta: number, ball: Ball): void {
    // Dash trigger
    if (this.dashRequested && this.canDash && this.moveDir.lengthSq() > 0.01) {
      this.state = PlayerState.Dash
      this.stateTimer = DASH_DURATION
      this.dashCooldown = DASH_COOLDOWN
      this.stamina -= STAMINA_DASH_COST
      this.isDashing = true
      this.dashRequested = false
      return
    }
    this.dashRequested = false

    if (this.moveDir.lengthSq() > 0.01) {
      const dir = this.moveDir.clone().normalize()
      this.facing.copy(dir)
      const sprintOk = this.sprinting && this.stamina > 0
      let speed = sprintOk ? SPRINT_SPEED : BASE_SPEED
      if (this.hasBall) speed *= CARRIER_PENALTY
      this.group.position.addScaledVector(dir, speed * delta)
      this.body.rotation.y = Math.atan2(dir.x, dir.z)
    }

    if (!this.hasBall && ball.isFree) {
      if (this.position.distanceTo(ball.position) < 1.25) {
        ball.attachTo(this)
      }
    }

    if (this.hasBall) ball.followCarrier(this)
  }

  private tickDash(delta: number, ball: Ball): void {
    this.stateTimer -= delta
    this.group.position.addScaledVector(this.facing, DASH_SPEED * delta)
    if (this.stateTimer <= 0) {
      this.state = PlayerState.Locomotion
      this.isDashing = false
    }
    if (this.hasBall) ball.followCarrier(this)
  }

  private tickTackle(delta: number): void {
    this.stateTimer -= delta
    this.group.position.addScaledVector(this.facing, TACKLE_DASH * delta)
    if (this.stateTimer <= 0) {
      this.state = PlayerState.Locomotion
      this.tackleCooldown = TACKLE_COOLDOWN
    }
  }

  private tickTimed(delta: number, nextState: PlayerState, nextDuration: number): void {
    this.stateTimer -= delta
    if (this.stateTimer <= 0) {
      this.state = nextState
      this.stateTimer = nextDuration
    }
  }

  triggerTackle(): void {
    if (!this.canTackle) return
    this.state = PlayerState.Tackle
    this.stateTimer = TACKLE_DURATION
  }

  triggerDash(): void {
    this.dashRequested = true
  }

  applyStun(): void {
    this.state = PlayerState.Stunned
    this.stateTimer = STUN_DURATION
    this.isDashing = false
  }

  applyKnockdown(): void {
    this.state = PlayerState.KnockedDown
    this.stateTimer = KNOCKDOWN_DUR
    this.isDashing = false
  }

  private updateVisuals(): void {
    // Glow ring pulses when dashing or sprinting
    if (this.isDashing) {
      this.glowMat.opacity = 1.0
      this.bodyMat.emissiveIntensity = 0.5
    } else if (this.sprinting && this.stamina > 0) {
      this.glowMat.opacity = 0.6 + Math.sin(Date.now() * 0.015) * 0.2
      this.bodyMat.emissiveIntensity = 0.2
    } else {
      this.glowMat.opacity = 0.35
      this.bodyMat.emissiveIntensity = 0.05
    }

    // Low stamina — body flashes red warning
    if (this.stamina < 20 && !this.isDashing) {
      const flash = Math.sin(Date.now() * 0.02) > 0
      this.bodyMat.emissive = flash
        ? new THREE.Color(0xff2200)
        : new THREE.Color(TEAM_COLORS[this.team]).multiplyScalar(0.12)
    } else {
      this.bodyMat.emissive = new THREE.Color(TEAM_COLORS[this.team]).multiplyScalar(
        this.bodyMat.emissiveIntensity
      )
    }
  }

  private clampPosition(): void {
    const p = this.group.position
    const b = 3
    p.x = THREE.MathUtils.clamp(p.x, -(PITCH.halfLength + b), PITCH.halfLength + b)
    p.z = THREE.MathUtils.clamp(p.z, -(PITCH.halfWidth  + b), PITCH.halfWidth  + b)
    p.y = 0
  }
}
