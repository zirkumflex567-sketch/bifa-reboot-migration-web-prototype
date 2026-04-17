# Session Log

## 2026-04-18
### Context
- User requested strict football-only continuation and reliable documentation discipline.

### Work Done
- Verified branch divergence and aligned local states.
- Cleaned mixed repository state and pushed football-only restore commit.
- Introduced documentation workflow files:
  - `docs/DOCUMENTATION_WORKFLOW.md`
  - `docs/CHANGELOG_LIVE.md`
  - `docs/DECISIONS.md`
  - `docs/SESSION_LOG.md`

### Validation
- `npm run test` passed.
- `npm run lint` passed.
- `npm run build` passed.

### Next
- Continue feature work from football backlog (set-piece restrictions, full penalty sequence, HUD/pause polish) with mandatory doc updates per change.

## 2026-04-18 (Live Playtest)
### Context
- User requested a visible desktop playtest run with full menu walkthrough and complete match observation.

### Work Done
- Ran a headful local playtest via Playwright against `http://127.0.0.1:4173`.
- Covered setup flow, captain changes, lineup preview, in-play controls, pause menu, resume/restart/back-to-setup.
- Ran a full fast QA match with end-state capture.

### Evidence
- Screenshots: `artifacts/live-playtest-2026-04-18/01_setup_screen.png` to `10b_qa_endstate.png`.
- End-state capture confirmed full-time overlay with score and winner.

### Findings
- Gameplay flow covered and working in this run:
  - setup + kickoff boot
  - in-play HUD/controls
  - pause menu actions
  - full-time end screen
- Non-gameplay tooling issue:
  - first long QA run closed the browser unexpectedly once (automation stability), then succeeded in a dedicated end-phase rerun.

## 2026-04-18 (AI Demo + Field Scale)
### Context
- User requested watchable desktop playtests without idle matches and more room for future high-action gameplay systems.

### Work Done
- Added AI-vs-AI demo mode:
  - setup screen mode button `AI DEMO`
  - URL switch `?aivsa=1` / `?demo=1`
  - auto-kickoff + autoplay enabled for observer playtests
- Increased pitch size and related world lighting/goal-glow placement.
- Updated player spawn spacing, camera bounds, and AI support/shoot ranges for the bigger field.

### Intent
- Enable reliable “spectator QA” runs where the match always progresses.
- Reduce field congestion and create headroom for future features (hard fouls, specials, more tactical movement).

### Follow-up
- Added autoplay full-time auto-restart in observer mode so AI demo can run continuously without manual restart input.

## 2026-04-18 (Obsidian + NotebookLM Integration)
### Context
- User requested mandatory integration of Obsidian and NotebookLM into the daily documentation loop.

### Work Done
- Checked NotebookLM MCP status:
  - reachable
  - not authenticated
  - no notebooks configured yet
- Added knowledge pack generator script:
  - `scripts/build_knowledge_pack.mjs`
  - outputs curated docs to `artifacts/knowledge/*`
- Added setup docs:
  - `docs/OBSIDIAN_SETUP.md`
  - `docs/NOTEBOOKLM_SETUP.md`
- Added npm script:
  - `npm run docs:pack`
- Updated README and documentation workflow to require pack regeneration.

### Outcome
- Obsidian and NotebookLM are now operationally integrated at workflow level.
- NotebookLM account auth and notebook creation remain one-time user-account steps.
