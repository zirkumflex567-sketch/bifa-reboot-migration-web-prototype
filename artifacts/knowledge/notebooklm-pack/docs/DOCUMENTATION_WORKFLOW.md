# Documentation Workflow

This file defines how we keep project documentation clean while building the football game.

## Goals
- Keep implementation and documentation in sync.
- Make every relevant change traceable.
- Keep markdown files ready for Obsidian and NotebookLM ingestion.

## Source of Truth
- Product and architecture direction:
  - `README.md`
  - `docs/Technical_Architecture.md`
  - `docs/GDD_Redline_FC.md`
  - `docs/GDD_Masterplan_ArcadeFootball.md`
- Execution and release status:
  - `docs/web-release-checklist.md`
  - `KNOWN_ISSUES.md`
  - `docs/Complete_Game_Development_Checklist.md`
  - `docs/release-notes-2026-04-17.md`
- Living logs:
  - `docs/CHANGELOG_LIVE.md`
  - `docs/DECISIONS.md`
  - `docs/SESSION_LOG.md`

## Required Updates Per Change
For every non-trivial implementation change, update:
1. `docs/SESSION_LOG.md` (what was done in this work session)
2. `docs/CHANGELOG_LIVE.md` (user-visible or system-visible delta)
3. `KNOWN_ISSUES.md` or `docs/web-release-checklist.md` if status changed

If a design or architecture decision was made, also update:
4. `docs/DECISIONS.md`

After doc updates, refresh export packs:
5. Run `npm run docs:pack` to regenerate Obsidian/NotebookLM sources.

## Commit Hygiene
- Commit code and docs together when possible.
- Avoid long doc-only drifts after major code changes.
- Use clear commit messages that mention feature/fix and docs update.

## Obsidian / NotebookLM Readiness
- Keep files in plain Markdown (`.md`) with stable headings.
- Prefer concise sections and explicit dates.
- Avoid putting source-of-truth content only in binary files.
- If a NotebookLM sync step is used later, ingest these first:
  - `README.md`
  - `docs/GDD_Redline_FC.md`
  - `docs/Technical_Architecture.md`
  - `docs/CHANGELOG_LIVE.md`
  - `docs/DECISIONS.md`
  - `docs/SESSION_LOG.md`
