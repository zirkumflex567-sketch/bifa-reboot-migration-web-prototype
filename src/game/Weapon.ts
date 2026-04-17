import * as THREE from 'three'
import { Enemy } from './Enemy'
import { Projectile } from './Projectile'
import { Vehicle } from './Vehicle'
import { useGameStore } from '../store'

export class Weapon {
  private baseFireRate = 0.35 // seconds between shots
  private fireTimer = 0
  private range = 15.0

  private muzzleFlashLight: THREE.PointLight
  private flashTimer = 0

  constructor() {
    this.muzzleFlashLight = new THREE.PointLight(0xffea00, 0, 10)
  }

  update(delta: number, vehicle: Vehicle, enemies: Enemy[], projectiles: Projectile[], scene: THREE.Scene): void {
    if (!this.muzzleFlashLight.parent) {
      scene.add(this.muzzleFlashLight)
    }

    if (this.flashTimer > 0) {
      this.flashTimer -= delta
      this.muzzleFlashLight.intensity = Math.max(0, this.flashTimer * 100)
    }

    if (this.fireTimer > 0) {
      this.fireTimer -= delta
    }
    
    if (this.fireTimer <= 0) {
      // Find nearest enemy
      let nearestEnemy: Enemy | null = null
      let minDist = this.range
      
      for (const enemy of enemies) {
        if (enemy.isDead()) continue
        const dist = enemy.position.distanceTo(vehicle.position)
        if (dist < minDist) {
          minDist = dist
          nearestEnemy = enemy
        }
      }
      
      if (nearestEnemy) {
        // Fire
        const { modifiers } = useGameStore.getState()
        
        const toEnemy = nearestEnemy.position.clone().sub(vehicle.position)
        toEnemy.y = 0
        const startPos = vehicle.position.clone().add(new THREE.Vector3(0, 1.2, 0)) // Roof height
        
        const proj = new Projectile(startPos, toEnemy)
        // Check Projectile constructor, it might not accept damage. Let's set it if we can.
        proj.damage += modifiers.damageBonus
        
        projectiles.push(proj)
        scene.add(proj.group)
        
        // Setup muzzle flash
        this.muzzleFlashLight.position.copy(startPos)
        this.muzzleFlashLight.intensity = 20
        this.flashTimer = 0.1
        
        // Audio and Shake
        import('./AssetManager').then(m => m.AssetManager.getInstance().playSound('shoot'))
        useGameStore.getState().showCallout("", 10) 
        window.dispatchEvent(new CustomEvent('WEAPON_FIRED'))
        
        const rate = this.baseFireRate / Math.max(1.0, modifiers.fireRateMult)
        this.fireTimer = rate
      }
    }
  }
}
