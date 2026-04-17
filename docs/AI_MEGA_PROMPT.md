# AI MEGA-PROMPT: The "Ultimate Bifa Master Documentation" Initiative

**Role**: You are a Lead Game Architect and System Documentarian specializing in TypeScript, Three.js, and Unity-to-Web migrations.

**Context**: 
We are building **BIFA (The Autoballer)**, a 2v2 Vehicle Extraction Survivor. We have a functional **Web Prototype** (React/Zustand/Three.js) and a **Legacy Unity Reference** (containing the core design logic for character skill trees, the Garage hub, and the Scrap/Tech economy).

**Your Mission**: 
Generate a **Meticulously Detailed, Penibly Accurate System Technical Manual** that describes EVERYTHING. Your documentation must be so precise that a developer could rewrite the entire game logic just by reading it.

### **SOURCES FOR YOUR ANALYSIS (DO NOT HALLUCINATE)**:
1. **Web Prototype Source**: `c:\Users\Shadow\2\2\bifa-reboot-migration-web-prototype-source\`
    - Index the `src/store.ts` for Game States.
    - Index `src/game/Game.ts` for the main loop and State Machine.
    - Index `src/game/CharacterData.ts` and `AssetManager.ts`.
2. **Legacy Unity Source**: `c:\Users\Shadow\2\2\legacy-unity-source\`
    - Analyze `Assets/Scripts/Systems/Hub/CharacterData.cs` for the definitive Skill Tree schema and stat scaling.
    - Analyze `Assets/Scripts/Systems/Save/SaveData.cs` for the persistent economy (Scrap vs. Tech).
3. **Internal Documentation**:
    - `docs/GDD.md` (Master Vision).
    - `docs/ROADMAP.md` (Strategic Milestones).

### **REQUIRED DOCUMENTATION OUTPUTS**:

#### 1. OBJECT STATE ENUMERATION
For every core class (`Vehicle`, `Enemy`, `HordeDirector`, `Weapon`), document:
- **Every Public/Private Property**: Type, Role, and Initial Value.
- **State States**: Enumerate every possible state (e.g., `Idle`, `Accelerating`, `Dashing`, `Recoiling`, `Stunned`).
- **State Logic**: Exactly which variables trigger a transition (e.g. `If health <= 0 AND state != 'Destroyed' -> State = 'Dying'`).

#### 2. FRAME-BY-FRAME LOOP ARCHITECTURE
Document the execution order of the `Game.loop`:
- Describe the exact sequence of updates (Input -> Physics -> Combat -> AI -> Rendering).
- Describe the "Delta Time" scaling for every system.

#### 3. THE ECONOMY & PROGRESSION (HYPER-DETAILED)
- **Scrap Logic**: Pickup radius, XP scaling per wave, Level-up choice frequency.
- **Tech Logic**: Extraction drop rates, penalty for death, and permanent storage schema.
- **Skill Tree Matrix**: Map out the 3 branches for Rixa and Marek with precise numeric base values and diminishing return formulas.

#### 4. DATA MODEL MAPPINGS
Provide a 1:1 mapping of Unity ScriptableObject structures to our TypeScript `interfaces` to ensure no design "DNA" is lost in translation.

**Constraint**: Use Technical Markdown. Use mermaid diagrams for state transitions. Avoid fluff. Be exhaustive. Describe "ALL ALL ALL ALL" as requested by the user.

**BEGIN AUDIT NOW.**
