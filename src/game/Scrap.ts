import * as THREE from 'three'
import { Vehicle } from './Vehicle'
import { useGameStore } from '../store'
import { AssetManager } from './AssetManager'

export class Scrap {
  readonly group = new THREE.Group()
  private mesh: THREE.Mesh
  public isCollected = false
  
  private value = 10
  private floatTime = 0
  
  constructor(startPos: THREE.Vector3, isLegendary = false) {
    this.value = isLegendary ? 500 : 10
    
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
    
    const dist = this.group.position.distanceTo(vehicle.position)
    if (dist < 2.5) {
      // Pick up
      this.isCollected = true
      
      const state = useGameStore.getState()
      const actualValue = Math.floor(this.value * state.modifiers.scrapMult)
      let newScrap = state.scrap + actualValue
      let newLevel = state.level
      
      // Level Up Logic (P0.3)
      if (newScrap >= state.xpToNextLevel) {
        newScrap -= state.xpToNextLevel
        newLevel++
        
        AssetManager.getInstance().playSound('levelup')

        useGameStore.getState().setMatchState({
          scrap: newScrap,
          level: newLevel,
          xpToNextLevel: Math.floor(state.xpToNextLevel * 1.5),
          phase: "UpgradeSelection" // Pause the WebGL Loop
        })
      } else {
        useGameStore.getState().setMatchState({ scrap: newScrap })
      }
    }
  }
}
