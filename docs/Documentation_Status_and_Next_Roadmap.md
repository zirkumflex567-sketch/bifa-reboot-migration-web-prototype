# Documentation Status & Next Roadmap (Web Prototype)

Stand: 2026-04-17
Branch: `master`

## 1) Repo-/Git-Status
- Arbeitsrepo: `/home/kevin/.hermes/hermes-agent/bifa-reboot-migration-web-prototype`
- Tracking: `master` gegen `origin/master`
- Letzter validierter Stand: beide Klone (WSL + Windows) auf identischem Commit
  - `fb314562b4f7cd37ea38c0a309845aa70ea12446`
- Lokale untracked Doku-Artefakte bleiben bewusst erhalten:
  - `DEPLOYMENT.md`
  - `LIVE_DEPLOY.md`
  - `docs/Documentation_Status_and_Next_Roadmap.md`
  - `docs/redline_prototype_documentation.docx`

## 2) Source-of-Truth-Dokumente (Web-Stand)
Primäre Referenzen für den aktuellen Projektzustand:
- `README.md`
- `BUILD.md`
- `KNOWN_ISSUES.md`
- `docs/web-release-checklist.md`
- `docs/release-notes-2026-04-17.md`
- `docs/performance-baseline.md`
- `docs/viewport-validation-matrix.md`
- `docs/bundle-size-history.md`

Hinweis zu älteren Unity-era Dokumenten:
- Historische/Legacy-Dateien bleiben als Kontext erhalten, sind aber nicht primäre Wahrheit für den Web-Status.

## 3) Konsistenz-Check (vor diesem Update)
Abgeglichen wurden:
- `README.md`
- `KNOWN_ISSUES.md`
- `docs/web-release-checklist.md`
- `docs/release-notes-2026-04-17.md`
- `docs/performance-baseline.md`

Erkannte Spannungen (bereinigt):
- Pause-UX war als „minimal“ formuliert, obwohl Overlay/Menu bereits implementiert ist.
- Performance-Aussage wirkte, als gäbe es gar keine Baseline, obwohl eine Build-/Preview-Baseline existiert.

## 4) DOCX-Status
- Datei ist lokal vorhanden: `docs/redline_prototype_documentation.docx`
- Sie ist aktuell ein ergänzendes Arbeitsartefakt (nicht die primäre, versionierte Single Source of Truth).

## 5) Priorisierte Roadmap (P0/P1/P2)
Siehe `docs/ROADMAP_NEXT.md` für DoD-orientierte Tasks.

Kurzfassung:
- **P0:** Set-piece Restrictions vollständig erzwingen; dedizierten player-controlled Penalty-Flow liefern.
- **P1:** Pause/Full-time UX konsistent polieren; HUD produktionsnäher machen.
- **P2:** Browser-/Viewport-Matrix vollständig abarbeiten; in-match FPS-/Frame-Spike-Profiling abschließen.

## 6) Arbeitsregel für nächste Iterationen
- Nach jedem Gameplay-/UX-Änderungssatz in derselben Session aktualisieren:
  1) `KNOWN_ISSUES.md`
  2) `docs/web-release-checklist.md`
  3) `docs/release-notes-<date>.md` (oder bestehende Notes fortschreiben)
- Dadurch bleiben Status, Roadmap und Release-Aussagen synchron.