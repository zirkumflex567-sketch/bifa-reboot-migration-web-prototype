# Game Design Document: BIFA (The Autoballer)

## 1. Vision & Core Concept
**BIFA** is a high-speed, 2v2 PvPvE Vehicle Extraction Survivor. It combines the chaotic power-scaling of "Bullet Heaven" games with the high-stakes risk/reward of "Extraction" shooters.

- **Genre**: Roguelite / Survival / Extraction / Vehicle Combat.
- **Pillars**:
    - **Clarity First**: Fixed top-down 3D camera for instant readability.
    - **Team Synergy**: Designed for 2v2 coordinated tactics (Tank/DPS loops).
    - **Risk-Reward**: You only keep the best loot (**Tech**) if you extract alive.
    - **The Garage**: Deep meta-progression using salvaged scrap and blueprints.

---

## 2. Core Gameplay Loop (The Match)
A typical match lasts 5–8 minutes.

1. **The Drop**: Players spawn in the Arena with their chosen vehicle and starting weapon.
2. **Survive & Scale**:
    - **Waves**: Enemies spawn in escalating intensity.
    - **Loot**: Deated enemies drop **Scrap** (common) and occasionally **Relic Tech** (rare).
    - **Level Up**: Collecting scrap grants XP. Leveling up offers a choice of 3 random run-upgrades (synergy-driven).
3. **The Boss & Extraction**:
    - At Wave 4, a Boss or Elite horde spawns.
    - Upon defeat, the **Extraction Zone** appears.
    - **Hold the Line**: Players must stay within the zone for 30 seconds while waves intensify.
4. **Conclusion**:
    - **Victory**: Successful extraction (Keep all Scrap + Tech).
    - **Defeat**: Wiped (Keep 50% Scrap, Lose 100% Tech).

---

## 3. Persistent Systems (The Meta)

### 3.1 The Garage (Hub)
The central home for the player between runs.
- **The Shop**: Spend **Scrap** to unlock new Vehicles, Weapons, and Bounties.
- **The Tech-Lab (Skill Trees)**: Spend **Tech** (extracted from runs) to unlock permanent nodes in the Character Skill Trees.

### 3.2 Currencies
- **Scrap (🔩)**: The "bread and butter" currency. High volume, low rarity.
- **Relic Tech (💠)**: High rarity. The primary driver for "Extraction" tension. Required for late-game skill tree nodes.

---

## 4. Characters & Skill Trees

### Rixa "Chromlilie" Voss (Speed / Alchemist)
- **Base Style**: Glass cannon, high mobility, status effect specialist.
- **Passive Trait**: **Chromrausch** (Stacking damage buff from any active status effects).
- **Skill Tree Branches**:
    - **A: Chrom-Alchemie**: Focus on burst damage and explosion chains.
    - **B: Secco & Chaos**: Focus on crowd control (Charm/Confuse).
    - **C: Herzbrecherin**: Focus on lifesteal and survivability through debuffs.

### Marek "Schrottanker" Graul (Tank / Engineer)
- **Base Style**: Heavy armor, slow movement, turret/drone specialist.
- **Passive Trait**: **Schrottkern** (Pickups generate temporary shields).
- **Skill Tree Branches**:
    - **A: Magnetik**: Massive loot pull radius and enemy slows.
    - **B: Drohnenwerk**: Summons and automates scrap-drones.
    - **C: Bollwerk**: Pure damage reduction and taunting mechanics.

---

## 5. Technical Requirements (Web Implementation)
- **Engine**: Three.js / React / Zustand.
- **Multiplayer**: Synchronized 2v2 via WebSockets/WebRTC.
- **Design Style**: "Polygon Pro" — Cel-shaded, flat colors, high-contrast silhouettes.
- **Performance**: Targeting 60fps on modern mobile and desktop browsers.
