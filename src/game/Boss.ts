import * as THREE from 'three'
import { Enemy } from './Enemy'
import { Vehicle } from './Vehicle'

export class Boss extends Enemy {
  isBoss = true

  constructor(startPosition: THREE.Vector3) {
    super(startPosition)
    
    // Boss specific scaling and stats
    this.hp = 1000
    this.speed = 10 // Faster than normal enemy
    this.damage = 30
    this.radius = 1.5

    // Scale up the model
    this.group.scale.set(2.5, 2.5, 2.5) // Bosses are BIG
    
    // Tint the boss red (to show it's powerful)
    this.body.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
        if (mat) {
          mat.color.setHex(0xff3333)
        }
      }
    })
  }

  private stompTimer = 3.0

  update(delta: number, target: Vehicle, allEnemies: Enemy[]): void {
    super.update(delta, target, allEnemies)
    
    // Boss Stomp: Periodic AoE pushback
    this.stompTimer -= delta
    if (this.stompTimer <= 0) {
      this.stompTimer = 5.0 // Every 5 seconds
      
      const dist = this.position.distanceTo(target.position)
      if (dist < 10) {
        // Push target away
        const pushDir = target.position.clone().sub(this.position).normalize()
        target.speed = target.maxSpeed * 0.8 // Force some speed
        target.group.position.addScaledVector(pushDir, 5.0) // Physical jump
        
        // FX: Roar/Stomp
        import('./FXManager').then(m => m.FXManager.getInstance().spawnExplosion(this.position, 0xff0000, 40))
      }
    }
  }
}
