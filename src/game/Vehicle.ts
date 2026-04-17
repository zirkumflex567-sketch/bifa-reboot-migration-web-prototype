import * as THREE from 'three'
import { Input } from './Input'
import { PITCH } from './World' // We can use the existing field dimensions for the arena boundary
import { AssetManager } from './AssetManager'
import { useGameStore } from '../store'

export class Vehicle {
  readonly group = new THREE.Group()
  private body!: THREE.Group
  
  // Physics / tuning
  speed = 0
  readonly maxSpeed = 15
  readonly acceleration = 25
  readonly deceleration = 10
  readonly brakeForce = 35
  readonly turnSpeed = 2.5 // Radians per second

  // Internal state
  private facingAngle = 0 // Radians, 0 is looking towards +Z
  
  constructor(startPosition: THREE.Vector3) {
    this.group.position.copy(startPosition)
    
    try {
      this.body = AssetManager.getInstance().getVehicleModel()
      this.group.add(this.body)
    } catch(e) {
      // Fallback
      const geometry = new THREE.BoxGeometry(1.4, 0.8, 3) 
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x3b8bff, 
        roughness: 0.6,
        metalness: 0.2
      })
      const fallback = new THREE.Mesh(geometry, material)
      fallback.position.y = 0.4
      this.body = new THREE.Group()
      this.body.add(fallback)
      this.group.add(this.body)
    }
  }

  get position(): THREE.Vector3 {
    return this.group.position
  }

  get facingDir(): THREE.Vector3 {
    // 0 angle means +Z direction.
    return new THREE.Vector3(Math.sin(this.facingAngle), 0, Math.cos(this.facingAngle))
  }

  update(delta: number, input: Input): void {
    // 1. Acceleration / Braking
    const gas = input.isDown('w', 'arrowup')
    const brake = input.isDown('s', 'arrowdown')
    
    const { modifiers } = useGameStore.getState()
    const currentMaxSpeed = this.maxSpeed * modifiers.speedMult
    const currentAccel = this.acceleration * modifiers.speedMult
    
    if (gas) {
      this.speed += currentAccel * delta
    } else if (brake) {
      this.speed -= this.brakeForce * delta
    } else {
      // Natural deceleration 
      if (this.speed > 0) {
        this.speed -= this.deceleration * delta
        if (this.speed < 0) this.speed = 0
      } else if (this.speed < 0) {
        this.speed += this.deceleration * delta
        if (this.speed > 0) this.speed = 0
      }
    }
    
    // Clamp speed
    this.speed = THREE.MathUtils.clamp(this.speed, -currentMaxSpeed * 0.4, currentMaxSpeed)
    
    // 2. Steering (only if moving)
    const speedRatio = Math.abs(this.speed) / this.maxSpeed
    if (speedRatio > 0.05) {
      const left = input.isDown('a', 'arrowleft')
      const right = input.isDown('d', 'arrowright')
      
      let turnStr = 0
      if (left) turnStr = 1
      if (right) turnStr = -1
      
      // If we are reversing, steering should feel reversed visually 
      // relative to world, but normal relative to car. We multiply by signs.
      const directionMult = this.speed >= 0 ? 1 : -1
      this.facingAngle += turnStr * this.turnSpeed * delta * directionMult
    }

    // 3. Apply position
    this.group.rotation.y = this.facingAngle
    const moveDir = this.facingDir.clone().multiplyScalar(this.speed * delta)
    this.group.position.add(moveDir)

    // 4. Boundary clamp (using PITCH from World.ts loosely as Arena bounds)
    const boundX = PITCH.halfLength - 2
    const boundZ = PITCH.halfWidth - 2
    
    this.group.position.x = THREE.MathUtils.clamp(this.group.position.x, -boundX, boundX)
    this.group.position.z = THREE.MathUtils.clamp(this.group.position.z, -boundZ, boundZ)
  }
}
