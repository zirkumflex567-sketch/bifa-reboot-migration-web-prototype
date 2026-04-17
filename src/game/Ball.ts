import * as THREE from 'three'
import { PITCH } from './World'
import type { Player, Team } from './Player'

/* ═══════════════════════════════════════════════════════════════════════
   Ball  —  state machine + simplified physics
   ═══════════════════════════════════════════════════════════════════════ */

export enum BallState {
  FreeRolling   = 'FreeRolling',
  Carried       = 'Carried',
  AirbornePass  = 'AirbornePass',
  AirborneShot  = 'AirborneShot',
  GoalScored    = 'GoalScored',
  RestartAttach = 'RestartAttach'
}

export interface BallOutOfBoundsEvent {
  kind: 'sideline' | 'goalLine'
  x: number
  z: number
}

const BALL_RADIUS   = 0.28
const FRICTION      = 2.5
const PASS_SPEED    = 14
const SHOOT_SPEED   = 22
const BALL_Y        = BALL_RADIUS

export class Ball {
  readonly mesh: THREE.Mesh
  state = BallState.FreeRolling
  velocity = new THREE.Vector3()

  carrier: Player | null = null
  lastToucher: Player | null = null
  possessionTeam: Team | null = null

  /** Which goal was scored into: -1 = left goal (team A scores), +1 = right (team B scores), 0 = none */
  scoredSide: -1 | 0 | 1 = 0
  private pendingOutEvent: BallOutOfBoundsEvent | null = null

  constructor() {
    const geo = new THREE.SphereGeometry(BALL_RADIUS, 16, 12)
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.05,
      emissive: 0x333333,
      emissiveIntensity: 0.3
    })
    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.castShadow = true
    this.mesh.position.y = BALL_Y
  }

  get position(): THREE.Vector3 { return this.mesh.position }
  get isFree(): boolean { return this.state === BallState.FreeRolling }

  resetToCenter(): void {
    this.mesh.position.set(0, BALL_Y, 0)
    this.velocity.set(0, 0, 0)
    this.state = BallState.FreeRolling
    this.carrier = null
    this.scoredSide = 0
    this.pendingOutEvent = null
  }

  consumeOutOfBoundsEvent(): BallOutOfBoundsEvent | null {
    const event = this.pendingOutEvent
    this.pendingOutEvent = null
    return event
  }

  attachTo(player: Player): void {
    this.carrier = player
    this.lastToucher = player
    this.possessionTeam = player.team
    player.hasBall = true
    this.state = BallState.Carried
    this.velocity.set(0, 0, 0)
  }

  followCarrier(player: Player): void {
    const offset = player.facingDir.multiplyScalar(0.7)
    this.mesh.position.set(
      player.position.x + offset.x,
      BALL_Y,
      player.position.z + offset.z
    )
  }

  releaseAsPass(direction: THREE.Vector3): void {
    if (!this.carrier) return
    this.carrier.hasBall = false
    this.lastToucher = this.carrier
    this.carrier = null
    this.state = BallState.AirbornePass
    this.velocity.copy(direction.normalize().multiplyScalar(PASS_SPEED))
  }

  releaseAsShot(direction: THREE.Vector3): void {
    if (!this.carrier) return
    this.carrier.hasBall = false
    this.lastToucher = this.carrier
    this.carrier = null
    this.state = BallState.AirborneShot
    this.velocity.copy(direction.normalize().multiplyScalar(SHOOT_SPEED))
  }

  forceRelease(): void {
    if (this.carrier) {
      this.carrier.hasBall = false
      this.lastToucher = this.carrier
      this.carrier = null
    }
    this.state = BallState.FreeRolling
  }

  update(delta: number): void {
    switch (this.state) {
      case BallState.Carried:
        break  // position set by followCarrier

      case BallState.FreeRolling:
      case BallState.AirbornePass:
      case BallState.AirborneShot:
        this.tickMoving(delta)
        break

      case BallState.GoalScored:
      case BallState.RestartAttach:
        break  // frozen
    }
  }

  private tickMoving(delta: number): void {
    // Apply velocity
    this.mesh.position.addScaledVector(this.velocity, delta)
    this.mesh.position.y = BALL_Y

    // Friction
    const speed = this.velocity.length()
    if (speed > 0.1) {
      const drag = 1 - FRICTION * delta / speed
      this.velocity.multiplyScalar(Math.max(drag, 0))
    } else {
      this.velocity.set(0, 0, 0)
      if (this.state !== BallState.FreeRolling) {
        this.state = BallState.FreeRolling
      }
    }

    // Out over side line -> throw-in
    if (Math.abs(this.mesh.position.z) > PITCH.halfWidth) {
      this.mesh.position.z = Math.sign(this.mesh.position.z) * PITCH.halfWidth
      this.velocity.set(0, 0, 0)
      this.state = BallState.RestartAttach
      this.pendingOutEvent = {
        kind: 'sideline',
        x: this.mesh.position.x,
        z: this.mesh.position.z,
      }
      return
    }

    // Check goal scoring
    this.checkGoal()

    // Out over goal line (outside goal mouth) -> corner/goal-kick
    if (Math.abs(this.mesh.position.x) > PITCH.halfLength &&
        Math.abs(this.mesh.position.z) > PITCH.goalWidth / 2) {
      this.mesh.position.x = Math.sign(this.mesh.position.x) * PITCH.halfLength
      this.velocity.set(0, 0, 0)
      this.state = BallState.RestartAttach
      this.pendingOutEvent = {
        kind: 'goalLine',
        x: this.mesh.position.x,
        z: this.mesh.position.z,
      }
    }
  }

  private checkGoal(): void {
    const x = this.mesh.position.x
    const z = this.mesh.position.z

    // Ball must cross goal line and be within goal width
    if (Math.abs(x) > PITCH.halfLength && Math.abs(z) <= PITCH.goalWidth / 2) {
      this.state = BallState.GoalScored
      this.velocity.set(0, 0, 0)
      // Negative x = left goal, team B scores into team A's goal -> team B scores
      // Positive x = right goal, team A scores into team B's goal -> team A scores
      this.scoredSide = x < 0 ? -1 : 1
    }
  }
}
