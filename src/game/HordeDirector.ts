import * as THREE from 'three'
import { Vehicle } from './Vehicle'
import { Enemy } from './Enemy'
import { PITCH } from './World'
import { useGameStore } from '../store'
import { getWaveConfig, WaveData } from './WaveConfig'
import { Boss } from './Boss'
import { FXManager } from './FXManager'

export class HordeDirector {
  enemies: Enemy[] = []
  private scene: THREE.Scene
  private vehicle: Vehicle
  
  private spawnTimer = 0
  private currentWave = 1
  private config: WaveData
  private enemiesLeftToSpawn = 0
  public scrapSpawnQueue: {pos: THREE.Vector3, isLegendary: boolean}[] = []

  constructor(scene: THREE.Scene, vehicle: Vehicle) {
    this.scene = scene
    this.vehicle = vehicle
    
    this.config = getWaveConfig(this.currentWave)
    this.enemiesLeftToSpawn = this.config.enemiesToSpawn
    this.spawnTimer = this.config.spawnInterval

    useGameStore.getState().setMatchState({ wave: this.currentWave, enemiesAlive: 0 })
  }

  update(delta: number): void {
    const state = useGameStore.getState()
    
    // Spawning logic (respect bounty enemyMaxAliveMult)
    const maxAlive = Math.ceil(this.config.maxAlive * state.bountyMult.enemyMaxAliveMult)
    if (this.enemiesLeftToSpawn > 0) {
      if (this.enemies.length < maxAlive) {
        this.spawnTimer -= delta
        if (this.spawnTimer <= 0) {
          this.spawnEnemy()
          this.enemiesLeftToSpawn--
          this.spawnTimer = this.config.spawnInterval
          useGameStore.getState().setMatchState({ enemiesAlive: this.enemies.length })
        }
      }
    } else if (this.enemies.length === 0) {
      // Wave complete!
      this.startNextWave()
    }
    
    // Update active enemies
    const deadEnemies: Enemy[] = []

    for (const enemy of this.enemies) {
      enemy.update(delta, this.vehicle, this.enemies)

      if (enemy.isDead()) {
        deadEnemies.push(enemy)
        this.scrapSpawnQueue.push({ pos: enemy.position.clone(), isLegendary: enemy.isBoss })
        useGameStore.getState().recordKill()
        
        // --- FX: EXPLOSION ---
        FXManager.getInstance().spawnExplosion(enemy.position, enemy.isBoss ? 0xffaa00 : 0x00ff88)
      } else {
        // Basic collision / damage to player
        const dist = enemy.position.distanceTo(this.vehicle.position)
        if (dist < 1.5) {
          this.dealDamageToVehicle(enemy.damage * delta)
        }
      }
    }

    // Cleanup dead enemies
    let diedThisFrame = false
    for (const dead of deadEnemies) {
      this.scene.remove(dead.group)
      const idx = this.enemies.indexOf(dead)
      if (idx !== -1) this.enemies.splice(idx, 1)
      diedThisFrame = true
    }
    
    if (diedThisFrame) {
      useGameStore.getState().setMatchState({ enemiesAlive: this.enemies.length })
    }
  }

  private spawnEnemy(): void {
    const boundX = PITCH.halfLength - 2
    const boundZ = PITCH.halfWidth - 2
    
    let x = 0, z = 0
    if (Math.random() > 0.5) {
      x = Math.random() > 0.5 ? boundX : -boundX
      z = (Math.random() * 2 - 1) * boundZ
    } else {
      x = (Math.random() * 2 - 1) * boundX
      z = Math.random() > 0.5 ? boundZ : -boundZ
    }
    
    const startPos = new THREE.Vector3(x, 0, z)
    const enemy = new Enemy(startPos)
    
    enemy.speed *= this.config.enemySpeedModifier
    enemy.hp *= this.config.enemyHpModifier
    
    this.enemies.push(enemy)
    this.scene.add(enemy.group)
  }

  private startNextWave(): void {
    this.currentWave++
    this.config = getWaveConfig(this.currentWave)
    this.enemiesLeftToSpawn = this.config.enemiesToSpawn
    this.spawnTimer = this.config.spawnInterval
    
    useGameStore.getState().setMatchState({ wave: this.currentWave })
    
    if (this.currentWave === 3 || this.currentWave % 10 === 0) {
      useGameStore.getState().showCallout(`BOSS INCOMING!`, 4000)
      this.spawnBoss()
    } else {
      useGameStore.getState().showCallout(`WAVE ${this.currentWave}`, 2000)
    }
  }

  public spawnBoss(): void {
    const startPos = new THREE.Vector3(0, 0, 20)
    const boss = new Boss(startPos)
    
    boss.hp *= this.config.enemyHpModifier
    
    this.enemies.push(boss)
    this.scene.add(boss.group)
    useGameStore.getState().setMatchState({ enemiesAlive: this.enemies.length })
  }

  private dealDamageToVehicle(amount: number): void {
    const state = useGameStore.getState()
    if (state.phase !== "InPlay") return

    // Marek Passive / Tech-Lab shield logic: Shield takes damage first
    if (state.shield > 0) {
      const shieldDmg = amount // shield is 1:1 for now
      let newShield = state.shield - shieldDmg
      if (newShield < 0) {
          // Carry over to health
          const remainder = -newShield
          newShield = 0
          this.applyHealthDamage(remainder)
      }
      useGameStore.getState().setMatchState({ shield: newShield })
      // FX: Impact
      FXManager.getInstance().spawnImpact(this.vehicle.position, 0xc9b7ff)
    } else {
      this.applyHealthDamage(amount)
      // FX: Metal sparks
      FXManager.getInstance().spawnImpact(this.vehicle.position, 0xffaa00)
    }
  }

  private applyHealthDamage(amount: number): void {
    const state = useGameStore.getState()
    const mitigation = Math.max(0, 1 - state.modifiers.armor * 0.01)
    const effective = amount * state.modifiers.incomingDamageMult * mitigation
    let newHealth = state.health - effective
    
    if (newHealth <= 0) {
      useGameStore.getState().setMatchState({ health: 0 })
      useGameStore.getState().showCallout("VEHICLE DESTROYED", 3000)
      useGameStore.getState().endRun("Died")
    } else {
      useGameStore.getState().setMatchState({ health: newHealth })
    }
  }
}
