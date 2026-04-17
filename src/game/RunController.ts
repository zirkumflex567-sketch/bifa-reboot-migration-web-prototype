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
      // 1. If we reached extraction wave and no enemies left, deploy extraction
      if (state.wave >= this.targetExtractionWave && state.enemiesAlive === 0 && !this.extractionDeployed) {
        this.extractionDeployed = true
        // Deploy in center for now
        this.extractionZone.activate(new THREE.Vector3(0, 0, 0))
      }
      
      // 2. Otherwise just normal horde loop
      if (!this.extractionDeployed) {
        this.hordeDirector.update(delta)
      }
    }
  }
}
