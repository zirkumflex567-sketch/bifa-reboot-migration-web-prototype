import * as THREE from 'three'
import { Vehicle } from './Vehicle'
import { useGameStore } from '../store'

export class ExtractionZone {
  readonly group = new THREE.Group()
  private ring: THREE.Mesh
  
  private active = false
  private holdTimer = 0
  private readonly requiredHoldTime = 3.0 // 3 seconds to extract
  private radius = 5.0

  constructor() {
    const geo = new THREE.RingGeometry(this.radius - 0.5, this.radius, 32)
    const mat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffaa, 
      transparent: true, 
      opacity: 0.5,
      side: THREE.DoubleSide
    })
    this.ring = new THREE.Mesh(geo, mat)
    this.ring.rotation.x = -Math.PI / 2
    this.ring.position.y = 0.1
    this.group.add(this.ring)
    
    // Hidden by default until activated
    this.group.visible = false
  }

  activate(position: THREE.Vector3): void {
    this.active = true
    this.group.visible = true
    this.group.position.copy(position)
    this.group.position.y = 0
    this.holdTimer = 0
    useGameStore.getState().showCallout("EXTRACTION ZONE DEPLOYED", 3000)
  }

  update(delta: number, vehicle: Vehicle): void {
    if (!this.active) return
    
    const state = useGameStore.getState()
    if (state.phase !== "InPlay") return

    const dist = this.group.position.distanceTo(vehicle.position)
    
    if (dist < this.radius) {
      // Inside zone
      this.holdTimer += delta;
      
      // Visual feedback via opacity pulsing
      (this.ring.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
      
      if (this.holdTimer >= this.requiredHoldTime) {
        this.triggerExtraction()
      }
    } else {
      // Outside zone
      this.holdTimer = 0;
      (this.ring.material as THREE.MeshBasicMaterial).opacity = 0.5;
    }
  }

  private triggerExtraction(): void {
    this.active = false
    this.group.visible = false
    
    useGameStore.getState().showCallout("EXTRACTION SUCCESSFUL", 3000)
    useGameStore.getState().setMatchState({ phase: "RunSummary" })
  }
}
