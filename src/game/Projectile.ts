import * as THREE from 'three'
import { Enemy } from './Enemy'

export class Projectile {
  readonly group = new THREE.Group()
  private mesh: THREE.Mesh
  public isDead = false
  
  private velocity: THREE.Vector3
  private lifeTime = 2.0
  public damage = 15

  constructor(startPos: THREE.Vector3, direction: THREE.Vector3) {
    const geo = new THREE.CylinderGeometry(0.1, 0.1, 2.0, 8)
    geo.rotateX(Math.PI / 2) // point along Z
    
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffee })
    this.mesh = new THREE.Mesh(geo, mat)
    this.group.add(this.mesh)
    
    this.group.position.copy(startPos)
    this.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction.clone().normalize())
    
    this.velocity = direction.normalize().multiplyScalar(45) // Fast tracer
  }

  update(delta: number, enemies: Enemy[]): void {
    if (this.isDead) return
    
    this.lifeTime -= delta
    if (this.lifeTime <= 0) {
      this.isDead = true
      return
    }
    
    // Move
    this.group.position.addScaledVector(this.velocity, delta)
    
    // Simple collision (using 2D horizontal distance to prevent flying over targets)
    for (const enemy of enemies) {
      if (enemy.isDead()) continue
      
      const enemyPos = enemy.position
      const projPos = this.group.position
      const dx = enemyPos.x - projPos.x
      const dz = enemyPos.z - projPos.z
      const distSq = dx * dx + dz * dz
      const range = enemy.radius + 0.3
      
      if (distSq < range * range) {
        enemy.takeDamage(this.damage)
        this.isDead = true
        break
      }
    }
  }
}
