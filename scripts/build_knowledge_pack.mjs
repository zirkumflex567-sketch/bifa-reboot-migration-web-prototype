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

  console.log(`Knowledge pack built at: ${outRoot}`)
  console.log(`Files included: ${sources.length}`)
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
