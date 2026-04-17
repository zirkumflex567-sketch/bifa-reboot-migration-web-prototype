import * as THREE from 'three'
import { Vehicle } from './Vehicle'
import { useGameStore } from '../store'
import { AssetManager } from './AssetManager'

export class Scrap {
  readonly group = new THREE.Group()
  private mesh: THREE.Mesh
  public isCollected = false
  
  private value = 10
  private techValue = 0
  private readonly isLegendary: boolean
  private floatTime = 0

  constructor(startPos: THREE.Vector3, isLegendary = false) {
    this.isLegendary = isLegendary
    this.value = isLegendary ? 500 : 10
    // GDD: Relic Tech is a rare drop from elite/boss encounters.
    this.techValue = isLegendary ? 1 : 0
    
    const geo = isLegendary ? new THREE.OctahedronGeometry(0.8, 0) : new THREE.OctahedronGeometry(0.3, 0)
    const mat = new THREE.MeshStandardMaterial({ 
      color: isLegendary ? 0xff0000 : 0x00ff88, 
      emissive: isLegendary ? 0xaa0000 : 0x00aa44,
      roughness: 0.1,
      metalness: 0.9
    })
    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.castShadow = true
    this.group.add(this.mesh)
    
    // Slight random offset from center
    const offset = new THREE.Vector3((Math.random() - 0.5), 0, (Math.random() - 0.5))
    if (isLegendary) {
      useGameStore.getState().showCallout("LEGENDARY SCRAP DROPPED!", 3000)
    }
    
    this.group.position.copy(startPos).add(offset)
    this.group.position.y = isLegendary ? 1.0 : 0.5
  }

  update(delta: number, vehicle: Vehicle): void {
    if (this.isCollected) return
    
    this.floatTime += delta
    this.mesh.rotation.y += delta * 2
    this.mesh.position.y = Math.sin(this.floatTime * 3) * 0.2
    
    const state = useGameStore.getState()
    const pickupRadius = 2.5 * (1 + (state.modifiers.pickupRadius / 100))
    const dist = this.group.position.distanceTo(vehicle.position)
    if (dist < pickupRadius) {
      this.isCollected = true

      const prevLevel = state.level
      state.addScrapInRun(this.value)
      if (this.techValue > 0 || this.isLegendary) {
        state.addTechInRun(this.techValue || 1)
      }

      // Marek Passive: Shield on pickup
      if (state.character === "marek") {
        const bonus = state.modifiers.shieldOnPickup || 5 // uses base 5 or skill-boosted value
        state.setMatchState({ shield: Math.min(state.maxShield, state.shield + bonus) })
      }

      // Level-up sound hook (phase flips to UpgradeSelection inside addScrapInRun)
      const after = useGameStore.getState()
      if (after.level > prevLevel) {
        AssetManager.getInstance().playSound('levelup')
      }
    }
  }
}
