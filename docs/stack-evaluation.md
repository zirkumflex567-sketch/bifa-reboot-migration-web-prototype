# Stack-Evaluation für den Unity-Ausstieg

## Ziel

Gesucht war nicht der theoretisch mächtigste Stack, sondern der schnellste Weg zu einem **spielbaren, branch-freundlichen Prototypen**.

## Bewertete Optionen

### 1. TypeScript + Three.js + Vite

**Urteil:** Gewinner für dieses Repo.

Warum:

- Three.js lässt sich direkt per npm oder CDN aufsetzen.
- Vite liefert einen sehr schnellen lokalen Entwicklungszyklus.
- Alles bleibt normales Web-Projekt ohne Editor-Lock-in.
- Ideal für schnelles Spiken in Branches.

### 2. PlayCanvas

**Urteil:** schnellster visueller Einstieg, aber nicht der beste Repo-Reset.

Warum:

- Der PlayCanvas Editor läuft komplett im Browser.
- Gleichzeitig ist der Editor ein stärker plattformzentrierter Workflow.
- Für einen sauberen Git-Branch-Umbau mit lokalem Code bleibt ein klassisches TypeScript-Repo kontrollierbarer.

### 3. Babylon.js

**Urteil:** stark, aber knapp hinter Three.js.

Warum:

- Sehr gute Docs und sofortiger Playground.
- Gute Wahl für Web-3D.
- Für das kleinste, flexibelste Reset-Setup ist Three.js im Ökosystem etwas neutraler und minimaler.

### 4. Java + libGDX / jMonkeyEngine

**Urteil:** nicht die schnellste Route.

Warum:

- Mehr initiales Tooling und klassischer Engine-/IDE-Setup.
- Browser- und Sharing-Loop wirkt schwerer als im Web-Stack.
- Für schnellen Produkt- oder Gameplay-Prototyping-Loop schlechter als TypeScript im Browser.

### 5. Godot 4 mit C#

**Urteil:** interessant, aber für diesen Fall nicht optimal.

Warum:

- Godot ist eine gute Unity-Alternative.
- Für browsernahe Prototypen gibt es jedoch weiterhin klare Web-Einschränkungen bei C#-Projekten in Godot 4.
- Wenn ohnehin ein Web-Ziel und extrem kurze Iteration gefragt sind, ist direkter Browser-Code attraktiver.

## Kurzmatrix

| Option | Setup-Speed | Iteration | Browser-Deploy | Git/Branch-Fit | Gesamt |
|---|---:|---:|---:|---:|---:|
| TypeScript + Three.js + Vite | 5 | 5 | 5 | 5 | **20** |
| PlayCanvas | 5 | 5 | 5 | 3 | 18 |
| Babylon.js + Vite | 4 | 5 | 5 | 5 | 19 |
| Godot 4 | 3 | 4 | 3 | 4 | 14 |
| Java + libGDX / jME | 2 | 3 | 3 | 4 | 12 |

## Entscheidung

Für **dieses** Projekt gilt:

- **Rendering-Basis:** Three.js
- **Sprache:** TypeScript
- **Dev-Server / Build:** Vite
- **UI vorerst:** HTML + CSS
- **Optional später:** React Three Fiber nur dann, wenn UI- und State-Komplexität stark wächst

## Quellen

- Three.js Installation: https://threejs.org/manual/en/installation.html
- Vite Guide: https://vite.dev/guide/
- PlayCanvas Editor: https://developer.playcanvas.com/user-manual/editor/
- Babylon Playground / First Step: https://doc.babylonjs.com/journey/theFirstStep
- libGDX Setup: https://libgdx.com/wiki/start/setup
- jMonkeyEngine Quick Start: https://jmonkeyengine.org/start/
- Godot Web Export: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html
