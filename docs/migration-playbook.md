# Migration Playbook: Unity → Web-Prototyp

## Prinzip

Nicht versuchen, Unity 1:1 zu kopieren. Stattdessen die Kernideen auf kleine, testbare Web-Module mappen.

## Mapping

| Unity | Neuer Web-Stack |
|---|---|
| Scene | `Game` + `World` Modul |
| MonoBehaviour | TypeScript-Klasse oder pure Funktion |
| Update() | zentraler Render-/Tick-Loop |
| Input System | kleines `Input`-Modul |
| Prefab | Factory-Funktion oder JSON-basierte Definition |
| Inspector-Werte | Konfigurationsobjekte / Datenmodule |
| UI Canvas | HTML/CSS Overlay |
| Build Target | Browser + statische Assets |

## Vorgehen

### Phase 1 – Reset

- Unity-spezifische Architektur verwerfen
- browserfähigen Spike herstellen
- wichtigste Kerninteraktion spielbar machen

### Phase 2 – Mechaniken isolieren

- Bewegung
- Interaktion
- Trigger/Events
- Spielzustand
- Kamera

### Phase 3 – Daten vom Rendering trennen

- Zustandsmodell definieren
- Rendering als reine Darstellung behandeln
- Asset-Ladepfade strukturieren

### Phase 4 – produktionsfähiger machen

- Savegame
- Audio
- Physik
- Debug-Tools
- Build- und Deployment-Pipeline

## Regeln

1. Keine neuen schweren Frameworks ohne klaren Nutzen.
2. UI erst mit HTML/CSS lösen.
3. Erst Mechanik validieren, dann Architektur verfeinern.
4. Erst dann React Three Fiber ergänzen, wenn die UI-/State-Komplexität es wirklich verlangt.
