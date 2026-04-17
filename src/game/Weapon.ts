import * as THREE from 'three'
import { Enemy } from './Enemy'
import { Projectile } from './Projectile'
import { Vehicle } from './Vehicle'
import { useGameStore } from '../store'

export class Weapon {
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
        // Read equipped weapon from loadout
        const storeState = useGameStore.getState()
        const loadout = storeState.loadout
        const modifiers = storeState.modifiers
        const wpId = loadout?.weaponId || "weapon_autocannon"
        
        let dmg = 15
        let rate = 0.35
        let color = 0xffffee
        
        if (wpId === "weapon_shotgun") {
          dmg = 8
          rate = 0.8
          color = 0xffaa00
        } else if (wpId === "weapon_rail") {
          dmg = 45
          rate = 1.2
          color = 0x00ffff
        } else if (wpId === "weapon_swarm") {
          dmg = 20
          rate = 0.5
          color = 0xff00ff
        }
        
        const toEnemy = nearestEnemy.position.clone().sub(vehicle.position)
        toEnemy.y = 0
        const startPos = vehicle.position.clone().add(new THREE.Vector3(0, 1.2, 0)) // Roof height
        
        // Rixa Passive: "Chromrausch" - +3% damage per status effect on nearby enemies
        let statusBonusMult = 1.0
        if (storeState.character === "rixa") {
          let statusCount = 0
          for (const e of enemies) {
            if (e.position.distanceTo(vehicle.position) < 15) {
               statusCount += e.activeStatuses.length
            }
          }
          statusBonusMult += Math.min(10, statusCount) * 0.03
        }
        
        const finalRate = rate / Math.max(1.0, modifiers.fireRateMult)
        this.fireTimer = finalRate
        
        // Multi-shot logic
        const shots = wpId === "weapon_shotgun" ? 5 : 1
        for (let i = 0; i < shots; i++) {
          let dir = toEnemy.clone().normalize()
          if (shots > 1) {
            const spread = (Math.random() - 0.5) * 0.5
            dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), spread)
          }
          const proj = new Projectile(startPos, dir)
          proj.damage = (dmg + modifiers.damageBonus) * statusBonusMult
          
          projectiles.push(proj)
          scene.add(proj.group)
        }

        // Setup muzzle flash
        this.muzzleFlashLight.color.setHex(color)
        this.muzzleFlashLight.position.copy(startPos)
        this.muzzleFlashLight.intensity = 20
        this.flashTimer = 0.1
        
        // Audio and Shake
        import('./AssetManager').then(m => m.AssetManager.getInstance().playSound('shoot'))
        window.dispatchEvent(new CustomEvent('WEAPON_FIRED'))
      }
    }
  }
}
