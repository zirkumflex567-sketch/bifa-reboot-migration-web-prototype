import * as THREE from 'three'
import { Vehicle } from './Vehicle'
import { Enemy } from './Enemy'
import { PITCH } from './World'
import { useGameStore } from '../store'
import { getWaveConfig, WaveData } from './WaveConfig'
import { Boss } from './Boss'

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
    // Spawning logic
    if (this.enemiesLeftToSpawn > 0) {
      if (this.enemies.length < this.config.maxAlive) {
        this.spawnTimer -= delta
        if (this.spawnTimer <= 0) {
          this.spawnEnemy()
          this.enemiesLeftToSpawn--
          this.spawnTimer = this.config.spawnInterval
          // Update UI state to show current active on-screen enemies
          useGameStore.getState().setMatchState({ enemiesAlive: this.enemies.length })
        }
      }
    } else if (this.enemies.length === 0) {
      // Wave complete!
      this.startNextWave()
    }
    
    // Update active enemies
    // Collect enemies that are dead
    const deadEnemies: Enemy[] = []

    for (const enemy of this.enemies) {
      enemy.update(delta, this.vehicle, this.enemies)

      if (enemy.isDead()) {
        deadEnemies.push(enemy)
        this.scrapSpawnQueue.push({ pos: enemy.position.clone(), isLegendary: enemy.isBoss })
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
    
    // Buff based on config
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
    
    // Boss Wave!
    if (this.currentWave === 3 || this.currentWave % 10 === 0) {
      useGameStore.getState().showCallout(`BOSS INCOMING!`, 4000)
      this.spawnBoss()
    } else {
      useGameStore.getState().showCallout(`WAVE ${this.currentWave}`, 2000)
    }
  }

  private spawnBoss(): void {
    const startPos = new THREE.Vector3(0, 0, 20)
    const boss = new Boss(startPos)
    
    // Buff based on wave
    boss.hp *= this.config.enemyHpModifier
    
    this.enemies.push(boss)
    this.scene.add(boss.group)
    useGameStore.getState().setMatchState({ enemiesAlive: this.enemies.length })
  }

  private dealDamageToVehicle(amount: number): void {
    // Only applied if InPlay and handled via central state
    const state = useGameStore.getState()
    if (state.phase !== "InPlay") return

    let newHealth = state.health - amount
    if (newHealth <= 0) {
      newHealth = 0
      useGameStore.getState().setMatchState({ phase: "GameOver", health: newHealth })
      useGameStore.getState().showCallout("VEHICLE DESTROYED", 3000)
    } else {
      useGameStore.getState().setMatchState({ health: newHealth })
    }
  }
}
