#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const repoRoot = process.cwd()
const entries = fs.readdirSync(repoRoot, { withFileTypes: true })

const ignoredNames = new Set([
  '.git',
  '.github',
  '.turbo',
  '.vercel',
  '.vscode',
  'node_modules',
  'apps',
  'packages',
  'infra',
  'docs',
  'scripts',
  'launchpad4-cockpit',
  'launchpad-dashboard',
  'modular-affiliate-system1',
])

const suspicious = []

for (const entry of entries) {
  const name = entry.name
  if (ignoredNames.has(name)) continue

  if (entry.isFile()) {
    const ext = path.extname(name)
    const basename = path.basename(name, ext)
    const isLongTokenLike = basename.length >= 80 && !/[.\s]/.test(basename)
    const hasDownloadArtifactExt = ext === '.download'
    const isSavedResource = name.toLowerCase() === 'saved_resource.html'

    if (isLongTokenLike || hasDownloadArtifactExt || isSavedResource) {
      suspicious.push(name)
    }
  }
}

if (suspicious.length > 0) {
  console.error('[repo-hygiene] Suspicious root artifacts detected:')
  for (const file of suspicious) {
    console.error(`  - ${file}`)
  }
  console.error('[repo-hygiene] Move these files into an archive directory or remove them from source control.')
  if (process.env.REPO_HYGIENE_STRICT === '1') {
    process.exit(1)
  }
  console.error('[repo-hygiene] Non-strict mode: continuing with warnings.')
}

console.log('[repo-hygiene] Passed')
