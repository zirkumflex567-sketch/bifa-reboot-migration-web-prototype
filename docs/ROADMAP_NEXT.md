# ROADMAP NEXT (Web Prototype)

Stand: 2026-04-17
Owner: TBD

## P0 — Next Sprint (Must-have für spielbaren MVP-Loop)

### 1) Set-piece restrictions vollständig erzwingen
Status: In Umsetzung (Control-Lock + Restart-Taker + team reposition templates + spacing + basic man-marking + adaptive defender tracking + short-restart variants aktiv; deeper advanced AI reactions offen)
Ziel:
- Während Corner/Goal-Kick/Throw-In sind nur erlaubte Aktionen und beteiligte Spieler steuerbar.

Definition of Done:
- Restart-Zustände sperren unzulässige Inputs zuverlässig.
- Mindestens je 1 Testfall pro Restart-Typ (corner/goal-kick/throw-in) vorhanden.
- Smoke-Test im laufenden Match bestätigt keine unzulässigen Spieleraktionen.

### 2) Player-controlled Penalty sequence
Status: In Umsetzung (shootable flow + save/rebound + aim/power + keeper read/anticipation aktiv; keeper-animation tiefe offen)
Ziel:
- Penalties laufen als eigener, steuerbarer Ablauf statt Auto-Goal.

Definition of Done:
- Eindeutiger Penalty-State mit Start, Schuss, Ergebnis, Rückkehr in Match-Flow.
- Erfolg/Misserfolg wird korrekt in Score/Restart überführt.
- Unit-Tests decken mindestens Happy Path + Miss/Save Path ab.

## P1 — UX/HUD Polishing

### 3) Pause/Full-time UX konsistent machen
Ziel:
- Bedienung und visuelle Sprache zwischen Pause-, Halbzeit- und Full-time-Zuständen vereinheitlichen.

Definition of Done:
- Einheitliche Overlay-Struktur und Tastatur-Navigation.
- Keine widersprüchlichen Labels/Actions zwischen den Zuständen.
- Kurzer UX-Smoke-Test dokumentiert (Desktop).

### 4) HUD auf produktionsnahen Stand bringen
Ziel:
- Lesbares, stabiles HUD ohne Überlappungen bei typischen Viewports.

Definition of Done:
- HUD-Elemente bleiben in 1366x768 und 1920x1080 lesbar/ohne Kollision.
- Baseline-Checks für 390x844 und 768x1024 dokumentiert.
- Offene HUD-Probleme in `KNOWN_ISSUES.md` reduziert/aktualisiert.

## P2 — Validation & Performance

### 5) Browser-/Viewport-Matrix abschließen
Ziel:
- Vollständige manuelle Validierung für Zielbrowser und Zielviewports.

Definition of Done:
- Matrix in `docs/viewport-validation-matrix.md` vollständig ausgefüllt.
- Abweichungen je Browser/Viewport inklusive Repro-Notizen dokumentiert.

### 6) In-match FPS/Frame-Spike-Profiling
Ziel:
- Ergänzung der vorhandenen Build-/Preview-Baseline um Gameplay-Performance.

Definition of Done:
- In-match FPS und Spike-Hinweise für mindestens Desktop + ein Low-end-Szenario dokumentiert.
- Ergebnisse in `docs/performance-baseline.md` ergänzt.
- Release-Checklist-Performance-Items auf belastbaren Status gesetzt.

## Dokumentations-Regel
Nach jedem abgeschlossenen Roadmap-Punkt synchronisieren:
- `KNOWN_ISSUES.md`
- `docs/web-release-checklist.md`
- `docs/release-notes-2026-04-17.md` (oder neue Release-Notes-Datei)
