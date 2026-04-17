import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════════════════════
   Football Pitch  —  1 unit ≈ 1 metre  (3v3 / 4v4 arena)
   Pitch: 60 × 40
   ═══════════════════════════════════════════════════════════════════════ */

export const PITCH = {
  length: 60,
  width:  40,
  halfLength: 30,
  halfWidth:  20,
  goalWidth:  8,
  goalDepth:  2.5,
  goalHeight: 3.2,
  penaltyAreaLength: 12,
  penaltyAreaWidth:  20,
  centerCircleRadius: 6,
  lineWidth: 0.12
} as const

/* ─── Polygon Pro – Synty-style arena environment ─── */

export function createWorld(scene: THREE.Scene): void {

  // ── Sky / Atmosphere ──
  scene.background = new THREE.Color(0x060c18)
  scene.fog = new THREE.FogExp2(0x060c18, 0.009)

  // ── Lighting ──
  const ambient = new THREE.AmbientLight(0x1a2a40, 0.7)
  scene.add(ambient)

  // Main stadium key light (warm)
  const key = new THREE.DirectionalLight(0xfff0cc, 2.8)
  key.position.set(20, 40, 15)
  key.castShadow = true
  key.shadow.mapSize.set(4096, 4096)
  key.shadow.camera.left   = -40
  key.shadow.camera.right  =  40
  key.shadow.camera.top    =  30
  key.shadow.camera.bottom = -30
  key.shadow.camera.near   = 1
  key.shadow.camera.far    = 100
  key.shadow.bias = -0.0005
  scene.add(key)

  // Fill light (cool blue from opposite)
  const fill = new THREE.DirectionalLight(0x4488cc, 0.9)
  fill.position.set(-20, 25, -10)
  scene.add(fill)

  // Stadium flood lights — 4 corners
  const floodPositions = [
    [-28, 14, -18], [28, 14, -18],
    [-28, 14,  18], [28, 14,  18],
  ] as const
  floodPositions.forEach(([x, y, z], i) => {
    const color = i % 2 === 0 ? 0x5599ff : 0xff5555
    const light = new THREE.SpotLight(color, 120, 65, Math.PI / 5, 0.5, 1.5)
    light.position.set(x, y, z)
    light.target.position.set(0, 0, 0)
    light.castShadow = false
    scene.add(light)
    scene.add(light.target)

    // Visible light fixture box
    const fixture = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.4, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.8, roughness: 0.3 })
    )
    fixture.position.set(x, y, z)
    scene.add(fixture)

    // Glow bulb
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      new THREE.MeshBasicMaterial({ color })
    )
    bulb.position.set(x, y - 0.3, z)
    scene.add(bulb)
  })

  // Behind-goal glow accents
  const goalGlow: [number, number][] = [[-35, 0], [35, 0]]
  goalGlow.forEach(([x, z]) => {
    const isA = x < 0
    const light = new THREE.PointLight(isA ? 0x3b8bff : 0xff4444, 80, 40)
    light.position.set(x, 8, z)
    scene.add(light)
  })

  // ── Ground / Turf ──
  buildTurf(scene)

  // ── Pitch Lines ──
  buildPitchLines(scene)

  // ── Goals ──
  buildGoal(scene, -1)  // Team A goal (left)
  buildGoal(scene,  1)  // Team B goal (right)

  // ── Stadium Barriers / Walls ──
  buildBarriers(scene)

  // ── Stadium tribunes (backdrop geometry) ──
  buildStadiumStands(scene)

  // ── Outer environment ──
  buildOuterGround(scene)
}

/* ─────────────── Turf ─────────────── */
function buildTurf(scene: THREE.Scene): void {
  // Base green
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a6f2a, roughness: 0.9, metalness: 0.01
  })
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(PITCH.length + 12, PITCH.width + 12),
    groundMat
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // Alternating turf stripes
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0x1f8034, roughness: 0.92, metalness: 0.01
  })
  const stripeW = PITCH.length / 10
  for (let i = 0; i < 10; i += 2) {
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(stripeW, PITCH.width),
      stripeMat
    )
    stripe.rotation.x = -Math.PI / 2
    stripe.position.set(-PITCH.halfLength + stripeW * i + stripeW / 2, 0.004, 0)
    stripe.receiveShadow = true
    scene.add(stripe)
  }
}

/* ─────────────── Lines ─────────────── */
function buildPitchLines(scene: THREE.Scene): void {
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const lw = PITCH.lineWidth

  const addLine = (x: number, z: number, w: number, h: number) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lineMat)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(x, 0.008, z)
    scene.add(mesh)
  }

  // Touchlines
  addLine(0, -PITCH.halfWidth, PITCH.length, lw)
  addLine(0,  PITCH.halfWidth, PITCH.length, lw)

  // Goal lines
  addLine(-PITCH.halfLength, 0, lw, PITCH.width)
  addLine( PITCH.halfLength, 0, lw, PITCH.width)

  // Center line
  addLine(0, 0, lw, PITCH.width)

  // Center circle
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(PITCH.centerCircleRadius - lw / 2, PITCH.centerCircleRadius + lw / 2, 48),
    lineMat
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.008
  scene.add(ring)

  // Center spot
  const spot = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), lineMat)
  spot.rotation.x = -Math.PI / 2
  spot.position.y = 0.009
  scene.add(spot)

  // Penalty areas
  const paL = PITCH.penaltyAreaLength
  const paW = PITCH.penaltyAreaWidth
  for (const s of [-1, 1] as const) {
    const xEdge = s * PITCH.halfLength
    const xMid  = s * (PITCH.halfLength - paL / 2)
    addLine(xEdge - s * paL, 0, lw, paW)          // penalty line
    addLine(xMid, -paW / 2, paL, lw)              // bottom line
    addLine(xMid,  paW / 2, paL, lw)              // top line
    // Penalty spot
    const pspot = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12), lineMat)
    pspot.rotation.x = -Math.PI / 2
    pspot.position.set(xEdge - s * 8, 0.009, 0)
    scene.add(pspot)
  }
}

/* ─────────────── Goals ─────────────── */
function buildGoal(scene: THREE.Scene, side: -1 | 1): void {
  const color = side === -1 ? 0x4499ff : 0xff4444
  const postMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd, roughness: 0.3, metalness: 0.7
  })
  const teamMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.5,
    emissive: new THREE.Color(color).multiplyScalar(0.3),
  })

  const gw = PITCH.goalWidth
  const gh = PITCH.goalHeight
  const gd = PITCH.goalDepth
  const r  = 0.13
  const group = new THREE.Group()

  // Posts
  const makePost = (zPos: number) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(r, r, gh + 0.1, 10), postMat)
    post.position.set(0, gh / 2, zPos)
    post.castShadow = true
    group.add(post)
    // Team color accent cap
    const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 1.2, 8, 8), teamMat)
    cap.position.set(0, gh + 0.05, zPos)
    group.add(cap)
  }
  makePost(-gw / 2)
  makePost( gw / 2)

  // Crossbar
  const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(r, r, gw, 10), postMat)
  crossbar.rotation.x = Math.PI / 2
  crossbar.position.set(0, gh, 0)
  crossbar.castShadow = true
  group.add(crossbar)

  // Back-post pillars (depth)
  for (const z of [-gw / 2, gw / 2]) {
    const bp = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r * 0.7, gh, 8), postMat)
    bp.position.set(-side * gd, gh / 2, z)
    group.add(bp)
  }

  // Net (wireframe-style translucent)
  const netMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.14,
    side: THREE.DoubleSide, wireframe: true
  })
  // Back net
  const backNet = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh, 10, 5), netMat)
  backNet.position.set(-side * gd, gh / 2, 0)
  group.add(backNet)
  // Top net
  const topNet = new THREE.Mesh(new THREE.PlaneGeometry(gw, gd, 10, 3), netMat)
  topNet.rotation.x = Math.PI / 2
  topNet.position.set(-side * gd / 2, gh, 0)
  group.add(topNet)
  // Side nets
  for (const z of [-gw / 2, gw / 2]) {
    const sideNet = new THREE.Mesh(new THREE.PlaneGeometry(gd, gh, 3, 5), netMat)
    sideNet.rotation.y = Math.PI / 2
    sideNet.position.set(-side * gd / 2, gh / 2, z)
    group.add(sideNet)
  }

  // Ground line glow under goal (team color)
  const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18 })
  const glowPlane = new THREE.Mesh(new THREE.PlaneGeometry(gd + 0.5, gw + 0.3), glowMat)
  glowPlane.rotation.x = -Math.PI / 2
  glowPlane.position.set(-side * gd / 2, 0.012, 0)
  group.add(glowPlane)

  group.position.x = side * PITCH.halfLength
  scene.add(group)
}

/* ─────────────── Barriers / Walls ─────────────── */
function buildBarriers(scene: THREE.Scene): void {
  const wallH     = 2.5
  const wallThick = 0.35
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x1a2440,
    roughness: 0.5,
    metalness: 0.6,
    emissive: new THREE.Color(0x112244),
  })
  // Glowing edge on top of walls
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x3355bb, transparent: true, opacity: 0.5 })

  // Side walls (touchlines)
  for (const zSign of [-1, 1] as const) {
    const z = zSign * (PITCH.halfWidth + 2.5)
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(PITCH.length + 10, wallH, wallThick),
      wallMat
    )
    wall.position.set(0, wallH / 2, z)
    wall.castShadow = true
    scene.add(wall)

    // Glow edge strip on top
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(PITCH.length + 10, 0.08, wallThick + 0.05),
      edgeMat
    )
    edge.position.set(0, wallH + 0.04, z)
    scene.add(edge)
  }

  // End walls (with goal gap)
  for (const xSign of [-1, 1] as const) {
    const halfW = (PITCH.width + 10 - PITCH.goalWidth) / 2
    for (const zOff of [-1, 1] as const) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThick, wallH, halfW),
        wallMat
      )
      wall.position.set(
        xSign * (PITCH.halfLength + 5),
        wallH / 2,
        zOff * (PITCH.goalWidth / 2 + halfW / 2)
      )
      wall.castShadow = true
      scene.add(wall)
    }
  }

  // Corner accent cubes (Synty-style corner pillars)
  const cornerMat = new THREE.MeshStandardMaterial({
    color: 0x223366, roughness: 0.4, metalness: 0.7
  })
  const corners = [
    [-PITCH.halfLength - 4.8, -PITCH.halfWidth - 2.2],
    [ PITCH.halfLength + 4.8, -PITCH.halfWidth - 2.2],
    [-PITCH.halfLength - 4.8,  PITCH.halfWidth + 2.2],
    [ PITCH.halfLength + 4.8,  PITCH.halfWidth + 2.2],
  ]
  for (const [x, z] of corners) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, wallH + 1, 1.2),
      cornerMat
    )
    pillar.position.set(x, (wallH + 1) / 2, z)
    pillar.castShadow = true
    scene.add(pillar)

    // Glowing top beacon
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x4488ff })
    )
    beacon.position.set(x, wallH + 1.1, z)
    scene.add(beacon)
  }
}

/* ─────────────── Stadium Stands (backdrop) ─────────────── */
function buildStadiumStands(scene: THREE.Scene): void {
  const standMat = new THREE.MeshStandardMaterial({
    color: 0x0d1a2e, roughness: 0.9, metalness: 0.1
  })

  // Long-side stands
  for (const zSign of [-1, 1] as const) {
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(PITCH.length + 20, 6, 8),
      standMat
    )
    stand.position.set(0, 3, zSign * (PITCH.halfWidth + 12))
    scene.add(stand)

    // Crowd dots (simple colored spheres suggesting fans)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 24; col++) {
        const fanColors = [0x3355aa, 0xaa3333, 0x33aa55, 0xaa8833]
        const fan = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 5, 5),
          new THREE.MeshBasicMaterial({ color: fanColors[Math.floor(Math.random() * fanColors.length)] })
        )
        fan.position.set(
          -PITCH.halfLength + col * (PITCH.length / 23),
          row * 1.2 + 1.2,
          zSign * (PITCH.halfWidth + 8 + row * 1.5)
        )
        scene.add(fan)
      }
    }
  }

  // Short-side stands
  for (const xSign of [-1, 1] as const) {
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(8, 5, PITCH.width + 24),
      standMat
    )
    stand.position.set(xSign * (PITCH.halfLength + 12), 2.5, 0)
    scene.add(stand)
  }
}

/* ─────────────── Outer Ground ─────────────── */
function buildOuterGround(scene: THREE.Scene): void {
  const mat = new THREE.MeshStandardMaterial({ color: 0x080e18, roughness: 1 })
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(200, 140), mat)
  outer.rotation.x = -Math.PI / 2
  outer.position.y = -0.05
  outer.receiveShadow = true
  scene.add(outer)
}
