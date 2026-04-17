import * as THREE from 'three'
import { Vehicle } from './Vehicle'
import { AssetManager } from './AssetManager'
import { useGameStore } from '../store'

export class Enemy {
  readonly group = new THREE.Group()
  protected body!: THREE.Group
  public isBoss = false
  
  speed: number = 8
  hp: number = 30
  damage: number = 4
  
  // To avoid clipping into each other
  radius = 0.6
  
  constructor(startPosition: THREE.Vector3) {
    this.group.position.copy(startPosition)
    
    try {
      this.body = AssetManager.getInstance().getEnemyModel()
      this.group.add(this.body)
    } catch(e) {
      const geo = new THREE.CylinderGeometry(this.radius, this.radius, 1.8, 8)
      const mat = new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.8 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.y = 0.9
      this.body = new THREE.Group()
      this.body.add(mesh)
      this.group.add(this.body)
    }
  }

  get position(): THREE.Vector3 {
    return this.group.position
  }

  takeDamage(amount: number): void {
    this.hp -= amount
    
    // Lifesteal logic
    const state = useGameStore.getState()
    if (state.modifiers.lifesteal > 0 && amount > 0) {
      const heal = amount * (state.modifiers.lifesteal / 100)
      state.setMatchState({ health: Math.min(state.maxHealth, state.health + heal) })
    }

    // Play hit sound
    AssetManager.getInstance().playSound('hit')
    
    // Flash white on hit
    this.body.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
        if (mat && mat.emissive) mat.emissive.setHex(0xffffff)
      }
    })
    
    setTimeout(() => {
      if (this.body && this.hp > 0) {
        this.body.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
            if (mat && mat.emissive) mat.emissive.setHex(0x000000)
          }
        })
      }
    }, 100)
  }

  isDead(): boolean {
    return this.hp <= 0
  }

  stunTimer: number = 0
  activeStatuses: { id: string, dps: number, timer: number }[] = []

  applyStatus(id: string, dps: number, duration: number) {
    const existing = this.activeStatuses.find(s => s.id === id)
    if (existing) {
      existing.timer = Math.max(existing.timer, duration)
    } else {
      this.activeStatuses.push({ id, dps, timer: duration })
    }
  }

  update(delta: number, target: Vehicle, allEnemies: Enemy[]): void {
    // Process Status Effects (DoTs)
    for (let i = this.activeStatuses.length - 1; i >= 0; i--) {
      const effect = this.activeStatuses[i]
      effect.timer -= delta
      this.takeDamage(effect.dps * delta)
      if (effect.timer <= 0) {
        this.activeStatuses.splice(i, 1)
      }
    }

    if (this.stunTimer > 0) {
      this.stunTimer -= delta
      return // skip movement and targeting while stunned
    }

    const toTarget = target.position.clone().sub(this.position)
    toTarget.y = 0
    
    const distToTarget = toTarget.length()
    
    // 1. Steering & Seeking
    let moveDir = new THREE.Vector3()
    if (distToTarget > 0.5) {
      moveDir.copy(toTarget).normalize()
      this.group.rotation.y = Math.atan2(moveDir.x, moveDir.z)
    }
    
    // 2. Separation (Avoid clipping with other enemies)
    const separation = new THREE.Vector3()
    let neighbors = 0
    for (const other of allEnemies) {
      if (other === this) continue
      const toOther = this.position.clone().sub(other.position)
      toOther.y = 0
      const d = toOther.length()
      const minSpacing = this.radius + other.radius + 0.2 // Small buffer
      
      if (d < minSpacing && d > 0.01) {
        // Push away inversely proportional to distance
        const pushForce = minSpacing - d
        separation.add(toOther.normalize().multiplyScalar(pushForce * 5))
        neighbors++
      }
    }
    // Push away from target if getting too close (so they don't sit inside the player and melt health)
    const dTarget = toTarget.length()
    if (dTarget < 1.8) {
      const pushForce = 1.8 - dTarget
      separation.add(toTarget.clone().normalize().multiplyScalar(-pushForce * 10))
      neighbors++
    }
    
    if (neighbors > 0) {
      moveDir.add(separation).normalize()
    }
    
    // 3. Apply movement
    this.group.position.addScaledVector(moveDir, this.speed * delta)
    this.group.position.y = 0 // Enforce grounding strictly
  }
}
