import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

export class AssetManager {
  private static instance: AssetManager
  
  private vehicleModel: THREE.Group | null = null
  private enemyModel: THREE.Group | null = null
  
  private textureLoader = new THREE.TextureLoader()
  private fbxLoader = new FBXLoader()
  
  private constructor() {}

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager()
    }
    return AssetManager.instance
  }

  private audioListener = new THREE.AudioListener()
  private audioLoader = new THREE.AudioLoader()
  
  private shootSoundBuf: AudioBuffer | null = null
  private hitSoundBuf: AudioBuffer | null = null
  private levelUpBuf: AudioBuffer | null = null

  public async preloadAll(): Promise<void> {
    const safeLoad = async <T,>(p: Promise<T>): Promise<T | null> => {
      try { return await p } catch(e) { console.warn("Asset load failed", e); return null }
    }

    const charactersTex = await safeLoad(this.textureLoader.loadAsync('/assets/textures/characters_main.png'))
    if (charactersTex) {
      charactersTex.colorSpace = THREE.SRGBColorSpace
      charactersTex.flipY = false
    }

    const [schrotty, characters, shootBuf, hitBuf, levelUpBuf] = await Promise.all([
      safeLoad(this.fbxLoader.loadAsync('/assets/models/schrotty.fbx')),
      safeLoad(this.fbxLoader.loadAsync('/assets/models/characters.fbx')),
      safeLoad(this.audioLoader.loadAsync('/assets/sounds/kick.wav')),
      safeLoad(this.audioLoader.loadAsync('/assets/sounds/punch.wav')),
      safeLoad(this.audioLoader.loadAsync('/assets/sounds/start.mp3'))
    ])
    
    this.shootSoundBuf = shootBuf
    this.hitSoundBuf = hitBuf
    this.levelUpBuf = levelUpBuf
    // Setup Vehicle (Schrotty)
    if (schrotty) {
      const bb = new THREE.Box3().setFromObject(schrotty)
      console.log("Original Schrotty BB Size:", bb.getSize(new THREE.Vector3()))
      
      schrotty.scale.setScalar(0.01) // often FBX from Unity needs 0.01 scale
      schrotty.updateMatrixWorld(true)
      console.log("Scaled Schrotty BB Size:", new THREE.Box3().setFromObject(schrotty).getSize(new THREE.Vector3()))
      
      schrotty.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
          if (!mat.map) {
            mat.color.setHex(0x555555) // fallback gray
            mat.roughness = 0.8
          }
        }
      })
      this.vehicleModel = schrotty
    }

    // Setup Enemy (Characters)
    if (characters) {
      const bbChar = new THREE.Box3().setFromObject(characters)
      console.log("Original Characters BB Size:", bbChar.getSize(new THREE.Vector3()))
      
      characters.scale.setScalar(0.01)
      characters.updateMatrixWorld(true)
      console.log("Scaled Characters BB Size:", new THREE.Box3().setFromObject(characters).getSize(new THREE.Vector3()))
      
      characters.position.y = 0
      characters.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          if (charactersTex) {
            const mat = new THREE.MeshStandardMaterial({
              map: charactersTex,
              roughness: 0.8
            })
            ;(child as THREE.Mesh).material = mat
          }
        }
      })
      this.enemyModel = characters
    }
  }

  public getAudioListener(): THREE.AudioListener {
    return this.audioListener
  }

  public playSound(type: 'shoot' | 'hit' | 'levelup'): void {
    const buf = type === 'shoot' ? this.shootSoundBuf :
                type === 'hit' ? this.hitSoundBuf : this.levelUpBuf
    if (!buf) return
    
    const sound = new THREE.Audio(this.audioListener)
    sound.setBuffer(buf)
    sound.setVolume(type === 'shoot' ? 0.2 : type === 'levelup' ? 0.8 : 0.4)
    if (type === 'shoot') sound.setDetune((Math.random() - 0.5) * 400) // Random pitch
    sound.play()
  }

  public getVehicleModel(): THREE.Group {
    if (!this.vehicleModel) throw new Error("Assets not loaded!")
    return this.vehicleModel.clone()
  }

  public getEnemyModel(): THREE.Group {
    if (!this.enemyModel) throw new Error("Assets not loaded!")
    return this.enemyModel.clone()
  }
}
