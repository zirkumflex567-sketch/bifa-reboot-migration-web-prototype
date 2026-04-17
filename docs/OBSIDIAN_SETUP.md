# Obsidian Setup

## Goal
Use Obsidian as a readable planning and history layer without forking source-of-truth away from the repo.

## Current Strategy
- Source of truth remains in this repository (`docs/*.md`, `README.md`, `KNOWN_ISSUES.md`).
- Obsidian consumes a generated mirror pack from `artifacts/knowledge/obsidian-vault`.

## Build the Obsidian Pack
Run:

```bash
npm run docs:pack
```

This generates:
- `artifacts/knowledge/obsidian-vault/*`
- `artifacts/knowledge/INDEX.md`
- `artifacts/knowledge/MANIFEST.json`

Key entry notes generated for Obsidian:
- `artifacts/knowledge/obsidian-vault/00_HOME.md`
- `artifacts/knowledge/obsidian-vault/10_Product_And_Rules.md`
- `artifacts/knowledge/obsidian-vault/20_Architecture_And_Quality.md`
- `artifacts/knowledge/obsidian-vault/30_Execution_And_Roadmap.md`

## Recommended Workflow
1. Implement feature/fix.
2. Update required docs (`SESSION_LOG`, `CHANGELOG_LIVE`, etc.).
3. Run `npm run docs:pack`.
4. Sync or copy `artifacts/knowledge/obsidian-vault` into your Obsidian vault.
5. Commit code + docs in same push.

## Guardrails
- Do not keep unique project truth only in Obsidian notes.
- If you add insights in Obsidian, port them back into repo markdown before closing the session.
