import * as THREE from 'three'
import { Input } from './Input'
import { Vehicle } from './Vehicle'
import { HUD } from './HUD'
import { createWorld } from './World'
import { useGameStore } from '../store'
import { HordeDirector } from './HordeDirector'
import { ExtractionZone } from './ExtractionZone'
import { RunController } from './RunController'
import { Weapon } from './Weapon'
import { Projectile } from './Projectile'
import { Scrap } from './Scrap'
import { AssetManager } from './AssetManager'

export class Game {
  private readonly container: HTMLElement
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene: THREE.Scene
  private readonly camera: THREE.PerspectiveCamera
  private readonly clock = new THREE.Clock()
  private readonly input = new Input()

  private vehicle!: Vehicle
  private hud!: HUD
  
  private hordeDirector!: HordeDirector
  private extractionZone!: ExtractionZone
  private runController!: RunController
  
  // Screen shake
  private cameraShakeIntensity = 0
  private readonly maxShake = 0.5
  
  private readonly weapon = new Weapon()
  private readonly projectiles: Projectile[] = []
  private readonly scraps: Scrap[] = []


  private cameraDistance = 20
  private cameraHeight = 12

  constructor(container: HTMLElement) {
    this.container = container

    // 1. Scene setup
    this.scene = new THREE.Scene()
    createWorld(this.scene)

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300)
    // Add audio listener after preloading, but we can do it later.
    // Actually, AssetManager getInstance doesn't require preloading to get listener!
    this.camera.add(AssetManager.getInstance().getAudioListener())

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    container.appendChild(this.renderer.domElement)

    // ── Event listeners ──
    window.addEventListener('resize', this.onResize)
    window.addEventListener('wheel', this.onWheel, { passive: true })
    window.addEventListener('WEAPON_FIRED', this.onWeaponFired as EventListener)

    this.onResize()
  }

  private onWeaponFired = (): void => {
    this.cameraShakeIntensity = Math.min(this.cameraShakeIntensity + 0.1, this.maxShake)
  }

  private initGameplay(): void {
    // 4. Vehicle & HUD
    this.vehicle = new Vehicle(new THREE.Vector3(0, 0, 0))
    this.scene.add(this.vehicle.group)
    
    this.hud = new HUD()

    // 5. Horde Logic
    this.hordeDirector = new HordeDirector(this.scene, this.vehicle)
    this.extractionZone = new ExtractionZone()
    this.scene.add(this.extractionZone.group)
    
    this.runController = new RunController(this.hordeDirector, this.extractionZone)
    this.updateCamera(true)
  }

  async start(): Promise<void> {
    try {
      await AssetManager.getInstance().preloadAll()
      this.initGameplay()
      useGameStore.getState().setMatchState({ phase: "WaitingToStart" })
      this.renderer.setAnimationLoop(this.loop)
    } catch(e) {
      console.error(e)
      useGameStore.getState().setMatchState({ phase: "WaitingToStart" })
      this.renderer.setAnimationLoop(this.loop)
    }
  }

  destroy(): void {
    this.renderer.setAnimationLoop(null)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('wheel', this.onWheel)
    window.removeEventListener('WEAPON_FIRED', this.onWeaponFired as EventListener)
    this.renderer.dispose()
  }

  /* ───────────────────────────── Game Loop ───────────────────────────── */

  private readonly loop = (): void => {
    const delta = Math.min(this.clock.getDelta(), 0.05)
    // Optional global time scale
    const timeScale = 1.0
    const scaledDelta = delta * timeScale
    
    const state = useGameStore.getState()

    // WaitingToStart is now handled entirely via the UI character selection overlay

    // 2. Play state
    if (state.phase === "InPlay") {
      this.vehicle.update(scaledDelta, this.input)
      
      // Update Weapon auto-shoot
      this.weapon.update(scaledDelta, this.vehicle, this.hordeDirector.enemies, this.projectiles, this.scene)
      
      // Update Projectiles
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i]
        p.update(scaledDelta, this.hordeDirector.enemies)
        if (p.isDead) {
          this.scene.remove(p.group)
          this.projectiles.splice(i, 1)
        }
      }
      
      // Spawning scrap from HordeDirector queue
      while (this.hordeDirector.scrapSpawnQueue.length > 0) {
        const item = this.hordeDirector.scrapSpawnQueue.pop()!
        const scrap = new Scrap(item.pos, item.isLegendary)
        this.scraps.push(scrap)
        this.scene.add(scrap.group)
      }
      
      // Update Scrap
      for (let i = this.scraps.length - 1; i >= 0; i--) {
        const s = this.scraps[i]
        s.update(scaledDelta, this.vehicle)
        if (s.isCollected) {
          this.scene.remove(s.group)
          this.scraps.splice(i, 1)
        }
      }

      this.runController.update(scaledDelta)
      this.extractionZone.update(scaledDelta, this.vehicle)

      // Decay camera shake
      if (this.cameraShakeIntensity > 0) {
        this.cameraShakeIntensity -= scaledDelta * 1.5
        if (this.cameraShakeIntensity < 0) this.cameraShakeIntensity = 0
      }
    }

    // 3. Camera (Chase Cam P0.1)
    this.updateCamera(false)

    // 4. HUD update
    const freshState = useGameStore.getState()
    this.hud.update(freshState.wave, freshState.enemiesAlive, freshState.health, freshState.phase)

    // 5. Render
    this.renderer.render(this.scene, this.camera)

    // 6. Clear input
    this.input.endFrame()
  }

  /* ─────────────────────── Camera ────────────────────────── */

  private updateCamera(snap: boolean): void {
    // Chase camera follows the vehicle's backend continuously
    const carPos = this.vehicle.position.clone()
    
    // We want to look behind the direction the car is FACING, not moving
    const facing = this.vehicle.facingDir
    
    // Position camera behind and above
    const offset = facing.clone().multiplyScalar(-this.cameraDistance)
    offset.y += this.cameraHeight
    
    const desiredPos = carPos.clone().add(offset)
    
    // Look at slightly above the car
    const lookTarget = carPos.clone()
    lookTarget.y += 1.5

    if (snap) {
      this.camera.position.copy(desiredPos)
      this.camera.lookAt(lookTarget)
    } else {
      // Smooth interpolation for camera position
      this.camera.position.lerp(desiredPos, 0.1)
      this.camera.lookAt(lookTarget)
    }

    // Apply Shake Offset
    if (this.cameraShakeIntensity > 0) {
      const offsetX = (Math.random() - 0.5) * this.cameraShakeIntensity
      const offsetY = (Math.random() - 0.5) * this.cameraShakeIntensity
      const offsetZ = (Math.random() - 0.5) * this.cameraShakeIntensity
      this.camera.position.x += offsetX
      this.camera.position.y += offsetY
      this.camera.position.z += offsetZ
    }
  }

  /* ─────────────────────── Resize / Wheel ────────────────────────── */

  private readonly onResize = (): void => {
    const w = this.container.clientWidth || window.innerWidth
    const h = this.container.clientHeight || window.innerHeight
    if (w === 0 || h === 0) return
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  private readonly onWheel = (e: WheelEvent): void => {
    this.cameraDistance = THREE.MathUtils.clamp(
      this.cameraDistance + e.deltaY * 0.05,
      10, 40
    )
    this.cameraHeight = this.cameraDistance * 0.6
  }
}
