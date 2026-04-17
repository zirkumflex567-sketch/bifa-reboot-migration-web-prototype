import * as THREE from 'three'

interface Particle {
  pos: THREE.Vector3
  vel: THREE.Vector3
  color: THREE.Color
  life: number
  maxLife: number
  size: number
}

export class FXManager {
  private static instance: FXManager
  private particles: Particle[] = []
  private readonly maxParticles = 2000
  
  private geometry: THREE.BufferGeometry
  private material: THREE.PointsMaterial
  private points: THREE.Points
  
  private positions: Float32Array
  private colors: Float32Array

  private constructor() {
    this.geometry = new THREE.BufferGeometry()
    this.positions = new Float32Array(this.maxParticles * 3)
    this.colors = new Float32Array(this.maxParticles * 3)

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
    // Note: PointsMaterial doesn't support per-point size easily without custom shader, 
    // but we can use size attenuation and a single size for now to keep it simple.
    
    this.material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })

    this.points = new THREE.Points(this.geometry, this.material)
    this.points.frustumCulled = false
  }

  static getInstance(): FXManager {
    if (!FXManager.instance) FXManager.instance = new FXManager()
    return FXManager.instance
  }

  get visualGroup(): THREE.Points {
    return this.points
  }

  spawnExplosion(pos: THREE.Vector3, color: number, count = 20): void {
    const col = new THREE.Color(color)
    for (let i = 0; i < count; i++) {
      this.addParticle(
        pos.clone(),
        new THREE.Vector3(
          (Math.random() - 0.5) * 15,
          Math.random() * 10,
          (Math.random() - 0.5) * 15
        ),
        col,
        0.5 + Math.random() * 0.5
      )
    }
  }

  spawnImpact(pos: THREE.Vector3, color = 0xffffff): void {
    const col = new THREE.Color(color)
    for (let i = 0; i < 5; i++) {
      this.addParticle(
        pos.clone(),
        new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          Math.random() * 5,
          (Math.random() - 0.5) * 5
        ),
        col,
        0.2 + Math.random() * 0.2
      )
    }
  }

  spawnSparkTrail(pos: THREE.Vector3, color = 0x00ffaa): void {
    this.addParticle(
      pos.clone().add(new THREE.Vector3((Math.random()-0.5)*0.5, 0.2, (Math.random()-0.5)*0.5)),
      new THREE.Vector3(0, Math.random() * 2, 0),
      new THREE.Color(color),
      0.3
    )
  }

  private addParticle(pos: THREE.Vector3, vel: THREE.Vector3, color: THREE.Color, life: number): void {
    if (this.particles.length >= this.maxParticles) return
    this.particles.push({
      pos, vel, color, life, 
      maxLife: life,
      size: 1.0
    })
  }

  update(delta: number): void {
    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute
    const colAttr = this.geometry.getAttribute('color') as THREE.BufferAttribute
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life -= delta
      
      if (p.life <= 0) {
        this.particles.splice(i, 1)
        continue
      }

      // Physics
      p.vel.y -= 15 * delta // Gravity
      p.pos.addScaledVector(p.vel, delta)
      
      // Update buffers
      const idx = i * 3
      this.positions[idx] = p.pos.x
      this.positions[idx + 1] = p.pos.y
      this.positions[idx + 2] = p.pos.z
      
      // Fade color
      const alpha = p.life / p.maxLife
      this.colors[idx] = p.color.r * alpha
      this.colors[idx + 1] = p.color.g * alpha
      this.colors[idx + 2] = p.color.b * alpha
    }

    // Zero out the rest of the buffer to hide old particles
    for (let i = this.particles.length; i < this.maxParticles; i++) {
      const idx = i * 3
      this.positions[idx] = 0
      this.positions[idx + 1] = -1000 // Out of sight
      this.positions[idx + 2] = 0
    }

    posAttr.needsUpdate = true
    colAttr.needsUpdate = true
  }
}
