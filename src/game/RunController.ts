import * as THREE from 'three'
import { HordeDirector } from './HordeDirector'
import { ExtractionZone } from './ExtractionZone'
import { useGameStore } from '../store'

export class RunController {
  private hordeDirector: HordeDirector
  private extractionZone: ExtractionZone
  
  // E.g., we extract at wave 4
  private targetExtractionWave = 4
  private extractionDeployed = false

  constructor(hordeDirector: HordeDirector, extractionZone: ExtractionZone) {
    this.hordeDirector = hordeDirector
    this.extractionZone = extractionZone
  }

  update(delta: number): void {
    const state = useGameStore.getState()
    
    if (state.phase === "InPlay") {
      // 1. If we reached extraction wave, deploy extraction zone (don't wait for enemies to be 0)
      if (state.wave >= this.targetExtractionWave && !this.extractionDeployed) {
        this.extractionDeployed = true
        // Deploy in center
        this.extractionZone.activate(new THREE.Vector3(0, 0, 0))
        this.hordeDirector.spawnBoss() // Extraction Guardian
        useGameStore.getState().showCallout("EXTRACTION GUARDIAN INCOMING!", 4000)
      }
      
      // 2. Continually run the horde director so enemies keep spawning during the 30s hold!
      this.hordeDirector.update(delta)
    }
  }
}
