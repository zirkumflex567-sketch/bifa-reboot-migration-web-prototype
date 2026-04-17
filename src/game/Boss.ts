import * as THREE from 'three'
import { Enemy } from './Enemy'

export class Boss extends Enemy {
  isBoss = true

  constructor(startPosition: THREE.Vector3) {
    super(startPosition)
    
    // Boss specific scaling and stats
    this.hp = 1000
    this.speed = 10 // Faster than normal enemy
    this.damage = 30
    this.radius = 1.5

    // Scale up the model
    this.group.scale.set(2.5, 2.5, 2.5) // Bosses are BIG
    
    // Tint the boss red (to show it's powerful)
    this.body.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
        if (mat) {
          mat.color.setHex(0xff3333)
        }
      }
    })
  }
}
