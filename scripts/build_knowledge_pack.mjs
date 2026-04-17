import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const outRoot = path.join(projectRoot, 'artifacts', 'knowledge')
const obsidianRoot = path.join(outRoot, 'obsidian-vault')
const notebooklmRoot = path.join(outRoot, 'notebooklm-pack')

const sources = [
  'README.md',
  'KNOWN_ISSUES.md',
  'docs/DOCUMENTATION_WORKFLOW.md',
  'docs/CHANGELOG_LIVE.md',
  'docs/DECISIONS.md',
  'docs/SESSION_LOG.md',
  'docs/GDD_Redline_FC.md',
  'docs/GDD_Masterplan_ArcadeFootball.md',
  'docs/Technical_Architecture.md',
  'docs/web-release-checklist.md',
  'docs/Complete_Game_Development_Checklist.md',
  'docs/release-notes-2026-04-17.md',
  'docs/manual-test-checklist.md',
]

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function copyInto(baseDir, relPath) {
  const source = path.join(projectRoot, relPath)
  const target = path.join(baseDir, relPath)
  await ensureDir(path.dirname(target))
  await fs.copyFile(source, target)
}

async function build() {
  await fs.rm(outRoot, { recursive: true, force: true })
  await ensureDir(obsidianRoot)
  await ensureDir(notebooklmRoot)

  for (const relPath of sources) {
    await copyInto(obsidianRoot, relPath)
    await copyInto(notebooklmRoot, relPath)
  }

  const generatedAt = new Date().toISOString()
  const manifest = {
    generatedAt,
    sourceCount: sources.length,
    sources,
  }

  const indexMd = [
    '# REDLINE FC Knowledge Pack',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Included Sources',
    ...sources.map((s) => `- \`${s}\``),
    '',
    '## Usage',
    '- Obsidian: copy `obsidian-vault/*` into your vault (or open the folder as vault).',
    '- NotebookLM: upload markdown files from `notebooklm-pack/*` as notebook sources.',
  ].join('\n')

  await fs.writeFile(path.join(outRoot, 'MANIFEST.json'), JSON.stringify(manifest, null, 2), 'utf8')
  await fs.writeFile(path.join(outRoot, 'INDEX.md'), indexMd, 'utf8')

  const obsidianHome = [
    '# REDLINE FC Knowledge Home',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Start Here',
    '- [[README]]',
    '- [[KNOWN_ISSUES]]',
    '- [[docs/DOCUMENTATION_WORKFLOW]]',
    '',
    '## Maps Of Content',
    '- [[10_Product_And_Rules]]',
    '- [[20_Architecture_And_Quality]]',
    '- [[30_Execution_And_Roadmap]]',
    '',
    '## Live Logs',
    '- [[docs/CHANGELOG_LIVE]]',
    '- [[docs/DECISIONS]]',
    '- [[docs/SESSION_LOG]]',
    '',
    '## Notes',
    '- Keep source-of-truth in repo markdown.',
    '- Treat this vault as a navigable mirror, not as the only canonical source.',
  ].join('\n')

  const obsidianMocProduct = [
    '# 10 Product And Rules',
    '',
    '- [[docs/GDD_Redline_FC]]',
    '- [[docs/GDD_Masterplan_ArcadeFootball]]',
    '- [[docs/web-release-checklist]]',
    '- [[KNOWN_ISSUES]]',
  ].join('\n')

  const obsidianMocArchitecture = [
    '# 20 Architecture And Quality',
    '',
    '- [[docs/Technical_Architecture]]',
    '- [[docs/Complete_Game_Development_Checklist]]',
    '- [[docs/manual-test-checklist]]',
    '- [[docs/release-notes-2026-04-17]]',
  ].join('\n')

  const obsidianMocExecution = [
    '# 30 Execution And Roadmap',
    '',
    '- [[docs/DOCUMENTATION_WORKFLOW]]',
    '- [[docs/CHANGELOG_LIVE]]',
    '- [[docs/DECISIONS]]',
    '- [[docs/SESSION_LOG]]',
  ].join('\n')

  const notebookBrief = [
    '# NotebookLM Briefing - REDLINE FC',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Purpose',
    'Use this notebook for source-grounded answers about gameplay, architecture, QA status, and roadmap.',
    '',
    '## Primary Sources',
    ...sources.map((s) => `- ${s}`),
    '',
    '## Recommended Query Patterns',
    '- "Summarize current status and top blockers with source references."',
    '- "Compare KNOWN_ISSUES against release checklist and list inconsistencies."',
    '- "What changed since last session according to changelog and session log?"',
    '- "Give sprint priorities based on open P0 and P1 items."',
    '',
    '## Operating Rule',
    'If NotebookLM output conflicts with repo files, repo markdown is the final source of truth.',
  ].join('\n')

  await fs.writeFile(path.join(obsidianRoot, '00_HOME.md'), obsidianHome, 'utf8')
  await fs.writeFile(path.join(obsidianRoot, '10_Product_And_Rules.md'), obsidianMocProduct, 'utf8')
  await fs.writeFile(path.join(obsidianRoot, '20_Architecture_And_Quality.md'), obsidianMocArchitecture, 'utf8')
  await fs.writeFile(path.join(obsidianRoot, '30_Execution_And_Roadmap.md'), obsidianMocExecution, 'utf8')
  await fs.writeFile(path.join(notebooklmRoot, 'NOTEBOOKLM_BRIEFING.md'), notebookBrief, 'utf8')

  console.log(`Knowledge pack built at: ${outRoot}`)
  console.log(`Files included: ${sources.length}`)
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
