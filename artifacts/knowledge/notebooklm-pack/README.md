# Bifa – Web Prototype Reset

Dieser Branch ist ein harter Reset weg von Unity hin zu einem leichten Web-Stack, der in Minuten statt in Stunden einen spielbaren Prototypen ermöglicht.

## Entscheidung in einem Satz

**Neuer Standard-Stack:** **TypeScript + Vite + Three.js**.

Nicht Java. Nicht Unity. Nicht erst ein schwerer Editor. Erst Prototyp, dann Architektur ausbauen.

## Warum dieser Wechsel?

- **Sehr kurzer Setup-Pfad:** Three.js unterstützt direkte Installation per npm oder CDN und passt damit perfekt zu einem schnellen Prototyping-Loop.
- **Schnelles lokales Feedback:** Vite liefert einen sofort startenden Dev-Server und schnelles Hot Module Replacement.
- **Browser als Zielplattform:** Kein Plattform-Build, kein Editor-Zwang, sofort teilbar.
- **Repo- und Branch-freundlich:** Alles liegt als normaler Code vor, keine großen Unity-Metadaten oder binären Szenenfiles.
- **Saubere Evolutionspfade:** Falls die UI später komplexer wird, kann React Three Fiber ergänzt werden, ohne die Render-Basis auszutauschen.

## Enthalten in diesem Reset

- spielbare 3D-Szene mit Bewegung, Kamera und Match-Flow
- 1P-Teamkontrolle mit Spielerwechsel per `Tab`
- durchgehender, absichtlich nerviger Vuvuzela-Stadionsound (nicht abschaltbar)
- minimales Projekt-Setup für Web-Prototypen
- Captain-Auswahl im Startscreen mit archetypenbasiertem Team-Lineup
- Live-Lineup-Vorschau im Setup-Screen vor dem Matchstart
- modulare Gameplay-Dateien unter `src/game/`
- Vitest-Basis für Match-Logik
- Entscheidungsdokumente für die Stack-Wahl
- Migrationsplan von alten Unity-Konzepten auf Web-Module

## Schnellstart

```bash
npm install
npm run dev
```

Danach im Browser die von Vite ausgegebene Adresse öffnen.

## Build

```bash
npm run test
npm run build
npm run preview
```

Stand dieses Arbeitsstands:
- `npm install` läuft sauber durch
- `npm run lint` läuft sauber durch
- `npm run test` läuft sauber durch
- `npm run build` läuft sauber durch
- `npm run preview` antwortet lokal erfolgreich

## Projektstruktur

```text
.
├── docs
│   ├── adr
│   │   └── 0001-move-from-unity-to-web-stack.md
│   ├── migration-playbook.md
│   ├── repo-status.md
│   └── stack-evaluation.md
├── src
│   ├── game
│   │   ├── Game.ts
│   │   ├── Input.ts
│   │   ├── Player.ts
│   │   └── World.ts
│   ├── main.ts
│   └── style.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Nächste Schritte

1. Kernmechaniken aus dem alten Unity-Projekt in isolierte TypeScript-Module schneiden.
2. Datenmodell für Entities, Interaktion und Spielzustand definieren.
3. UI/HUD in HTML/CSS halten, bis echter 3D-UI-Bedarf entsteht.
4. Erst bei Bedarf Physik, Savegame, Networking oder Editor-Layer ergänzen.

## Wichtiger Hinweis

Das ursprüngliche `bifa`-Unity-Repo war in dieser Arbeitsumgebung nicht vorhanden. Deshalb bildet dieser Branch einen **vollständigen lokalen Reset/Spike**, der die neue Richtung sauber vorbereitet und direkt ausführbaren Web-Prototyp-Code enthält.

## Documentation Discipline (Active)

To keep development traceable and sync-safe, we maintain a live documentation loop:

- Workflow rules: `docs/DOCUMENTATION_WORKFLOW.md`
- Running changelog: `docs/CHANGELOG_LIVE.md`
- Architecture/product decisions: `docs/DECISIONS.md`
- Session-by-session log: `docs/SESSION_LOG.md`
- Obsidian integration: `docs/OBSIDIAN_SETUP.md`
- NotebookLM integration: `docs/NOTEBOOKLM_SETUP.md`

Build the knowledge pack for both tools:

```bash
npm run docs:pack
```
