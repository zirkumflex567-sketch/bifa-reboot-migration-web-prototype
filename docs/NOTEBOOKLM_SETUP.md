# NotebookLM Setup

## Status (2026-04-18, updated)
- NotebookLM MCP health: reachable
- Authenticated: yes
- Active notebook in library: `redline-fc-project-docs`
- Notebook URL: `https://notebooklm.google.com/notebook/c0e4fdde-cdb0-454e-9901-2aacbc871a87?authuser=4`

## Goal
Use NotebookLM for source-grounded Q&A against project docs while keeping the repo as single source of truth.

## Prepare Source Pack
Run:

```bash
npm run docs:pack
```

Then use markdown files under:
- `artifacts/knowledge/notebooklm-pack`
- `artifacts/knowledge/notebooklm-pack/NOTEBOOKLM_BRIEFING.md` (generated guidance + query patterns)

## First-time NotebookLM MCP Setup
1. Authenticate:
   - run NotebookLM MCP auth flow (`setup_auth`) and complete Google login.
2. Create a notebook in NotebookLM.
3. Upload/select files from `artifacts/knowledge/notebooklm-pack`.
4. Copy notebook share URL.
5. Add notebook to MCP library (`add_notebook`) with metadata.

## Suggested Notebook Metadata
- Name: `REDLINE FC - Source of Truth`
- Topics:
  - Gameplay loop
  - Match rules and state machine
  - QA and release status
  - Architecture and roadmap
- Use cases:
  - Fast source-grounded project Q&A
  - Sprint planning and scope checks
  - Regression triage with doc references

## Ongoing Workflow
1. After each feature batch: update docs.
2. Rebuild pack: `npm run docs:pack`.
3. Re-upload changed files to NotebookLM notebook.
4. Use NotebookLM queries for sanity checks before major merges.
