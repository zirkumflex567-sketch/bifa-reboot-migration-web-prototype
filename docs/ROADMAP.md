# Strategic Roadmap: BIFA (The Autoballer)

## Phase 1: Meta-Foundations & The Garage (P0)
**Goal**: Establish the core loop and persistence.
- [ ] **Save System**: Implement persistent storage for Scrap and Tech using Zod schema for robustness.
- [ ] **The Hub (Garage) UI**: Create the management scene for character and vehicle selection.
- [ ] **The Shop**: Basic meta-shop for unlocking starting weapons and vehicles.
- [ ] **Currency Integration**: Track Scrap and Tech extraction states.

## Phase 2: Character Depth & Skill Trees (P0.5)
**Goal**: Implement the long-term progression that creates "Build Value."
- [ ] **Skill Tree UI**: A branching, visual editor-style UI for allocating Tech points.
- [ ] **Trait Implementation**: Complete the logic for Rixa's Alchemistry and Marek's Drone systems.
- [ ] **Bounty System**: Pre-run "contract" selection to modify run difficulty and rewards.

## Phase 3: Production Polish & "Polygon Pro" (P1)
**Goal**: Bring the game to a visually competitive standard.
- [ ] **Animation Pass**: Implement `AnimationMixer` logic and connect FBX animations for vehicles and enemies.
- [ ] **Cel-Shading Shaders**: Implement a custom `ShaderMaterial` for high-contrast outlines and flat-shaded colors.
- [ ] **Juice & Particles**: Added GPU-efficient particle pools for explosions, collection trails, and muzzle flashes.
- [ ] **Sound Pass**: Normalizing audio and adding positional 3D sound.

## Phase 4: Social & Multiplayer (P2)
**Goal**: Enable the 2v2 competitive vision.
- [ ] **WebSocket Sync**: Real-time state synchronization for player positions, health, and enemy spawns.
- [ ] **Matchmaking**: Simple lobby system for 2v2 or coop play.
- [ ] **Leaderboards**: Global ranking based on "High Stakes Tech Extraction."
- [ ] **Cross-Device Support**: Mobile touch-control optimization.
