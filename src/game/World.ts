import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════════════════════
   Arena Bounds
   ═══════════════════════════════════════════════════════════════════════ */

export const PITCH = {
  length: 80,
  width: 80,
  halfLength: 40,
  halfWidth: 40,
} as const

export function createWorld(scene: THREE.Scene): void {
  // ── Sky / fog ──
  scene.background = new THREE.Color(0x1a1a24)
  scene.fog = new THREE.FogExp2(0x1a1a24, 0.010)

  // ── Lights ──
  const ambient = new THREE.AmbientLight(0xffffff, 0.7) // Much brighter ambient
  scene.add(ambient)

  const moon = new THREE.DirectionalLight(0xaaccff, 1.8) // Brighter directional
  moon.position.set(-20, 40, -10)
  moon.castShadow = true
  moon.shadow.mapSize.set(2048, 2048)
  moon.shadow.camera.left = -50
  moon.shadow.camera.right = 50
  moon.shadow.camera.top = 50
  moon.shadow.camera.bottom = -50
  moon.shadow.camera.near = 1
  moon.shadow.camera.far = 100
  scene.add(moon)

  // Arena-style point lights in corners
  const addSpot = (x: number, z: number, color: number) => {
    const spot = new THREE.PointLight(color, 200, 80) // Increase intensity and distance
    spot.position.set(x, 15, z)
    scene.add(spot)
  }
  addSpot(-35, -35, 0xff4422)
  addSpot(35, 35, 0x2288ff)
  addSpot(-35, 35, 0xffaa00)
  addSpot(35, -35, 0x00ffaa)

  // ── Ground / Dirt ──
  const groundGeo = new THREE.PlaneGeometry(120, 120, 16, 16)
  
  // slightly displacing the ground vertices for rough terrain
  const posAttribute = groundGeo.attributes.position
  for (let i = 0; i < posAttribute.count; i++) {
    const z = posAttribute.getZ(i)
    if (Math.random() > 0.5) posAttribute.setZ(i, z + (Math.random() * 0.5 - 0.25))
  }
  groundGeo.computeVertexNormals()

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x33333b, // Significantly lighter gray/blue
    roughness: 0.8,
    metalness: 0.2
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // ── Arena Boundary Walls (Hex/Cyber style) ──
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.8,
    metalness: 0.5,
    emissive: 0x110000
  })

  const wallHeight = 4
  const wallThick = 1

  // Outer Box
  const NWall = new THREE.Mesh(new THREE.BoxGeometry(PITCH.length + 2, wallHeight, wallThick), wallMat)
  NWall.position.set(0, wallHeight/2, -PITCH.halfWidth - 0.5)
  NWall.castShadow = true
  scene.add(NWall)

  const SWall = new THREE.Mesh(new THREE.BoxGeometry(PITCH.length + 2, wallHeight, wallThick), wallMat)
  SWall.position.set(0, wallHeight/2, PITCH.halfWidth + 0.5)
  SWall.castShadow = true
  scene.add(SWall)

  const EWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, PITCH.width + 2), wallMat)
  EWall.position.set(PITCH.halfLength + 0.5, wallHeight/2, 0)
  EWall.castShadow = true
  scene.add(EWall)

  const WWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, PITCH.width + 2), wallMat)
  WWall.position.set(-PITCH.halfLength - 0.5, wallHeight/2, 0)
  WWall.castShadow = true
  scene.add(WWall)

  // ── Scraps & Obstacles ──
  const obstacleMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.7,
    metalness: 0.8
  })
  
  for (let i = 0; i < 20; i++) {
    const s = 1 + Math.random() * 2
    const obsGeo = new THREE.BoxGeometry(s, s*2, s)
    const obs = new THREE.Mesh(obsGeo, obstacleMat)
    
    // Random position avoiding direct center (spawn)
    let rx = 0, rz = 0
    do {
      rx = (Math.random() - 0.5) * (PITCH.length - 10)
      rz = (Math.random() - 0.5) * (PITCH.width - 10)
    } while (Math.abs(rx) < 10 && Math.abs(rz) < 10)

    obs.position.set(rx, s, rz)
    obs.rotation.y = Math.random() * Math.PI
    obs.castShadow = true
    obs.receiveShadow = true
    scene.add(obs)
  }
}
