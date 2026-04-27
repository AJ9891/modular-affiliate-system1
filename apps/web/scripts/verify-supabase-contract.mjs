#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const cwd = process.cwd()
const workspaceRoot = fs.existsSync(path.join(cwd, 'src')) ? cwd : path.join(cwd, 'apps', 'web')
const repoRoot = fs.existsSync(path.join(workspaceRoot, '..', '..', 'infra'))
  ? path.resolve(workspaceRoot, '..', '..')
  : path.resolve(workspaceRoot, '..')

const sourceDirs = [path.join(workspaceRoot, 'src')]
const sqlLocations = [
  path.join(repoRoot, 'infra', 'supabase-schema.sql'),
  path.join(repoRoot, 'infra', 'migrations'),
  path.join(workspaceRoot, 'supabase', 'migrations'),
]

const OPTIONAL_RELATIONS = new Set(['funnel_pages'])

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, out)
      continue
    }
    out.push(fullPath)
  }
  return out
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }
}

function lineAt(content, index) {
  let line = 1
  for (let i = 0; i < index; i += 1) {
    if (content.charCodeAt(i) === 10) line += 1
  }
  return line
}

function collectSqlFiles() {
  const files = []
  for (const location of sqlLocations) {
    if (!fs.existsSync(location)) continue
    const stat = fs.statSync(location)
    if (stat.isFile()) {
      files.push(location)
      continue
    }
    files.push(...walk(location).filter((file) => file.endsWith('.sql')))
  }
  return files
}

function collectCodeFiles() {
  const files = []
  for (const dir of sourceDirs) {
    files.push(...walk(dir))
  }
  return files.filter((file) => /\.(ts|tsx|js|jsx)$/.test(file))
}

function collectDefinitions(sqlFiles) {
  const relations = new Set()
  const functions = new Set()

  const tableRegex =
    /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:[a-zA-Z_][a-zA-Z0-9_]*\.)?"?([a-zA-Z_][a-zA-Z0-9_]*)"?/gi
  const viewRegex =
    /create\s+(?:materialized\s+)?view\s+(?:if\s+not\s+exists\s+)?(?:[a-zA-Z_][a-zA-Z0-9_]*\.)?"?([a-zA-Z_][a-zA-Z0-9_]*)"?/gi
  const functionRegex =
    /create\s+(?:or\s+replace\s+)?function\s+(?:[a-zA-Z_][a-zA-Z0-9_]*\.)?"?([a-zA-Z_][a-zA-Z0-9_]*)"?\s*\(/gi

  for (const filePath of sqlFiles) {
    const content = readFileSafe(filePath)
    let match

    while ((match = tableRegex.exec(content)) !== null) {
      relations.add(match[1].toLowerCase())
    }
    while ((match = viewRegex.exec(content)) !== null) {
      relations.add(match[1].toLowerCase())
    }
    while ((match = functionRegex.exec(content)) !== null) {
      functions.add(match[1].toLowerCase())
    }
  }

  return { relations, functions }
}

function collectUsage(codeFiles) {
  const relationRefs = new Map()
  const functionRefs = new Map()

  const fromRegex = /\.from\(\s*['"`]([a-zA-Z_][a-zA-Z0-9_]*)['"`]\s*\)/g
  const rpcRegex = /\.rpc\(\s*['"`]([a-zA-Z_][a-zA-Z0-9_]*)['"`]\s*/g

  function pushRef(map, key, ref) {
    const list = map.get(key) || []
    list.push(ref)
    map.set(key, list)
  }

  for (const filePath of codeFiles) {
    const content = readFileSafe(filePath)
    let match

    while ((match = fromRegex.exec(content)) !== null) {
      const preContext = content.slice(Math.max(0, match.index - 24), match.index)
      if (preContext.includes('.storage')) continue

      const relation = match[1].toLowerCase()
      pushRef(relationRefs, relation, {
        file: filePath,
        line: lineAt(content, match.index),
      })
    }

    while ((match = rpcRegex.exec(content)) !== null) {
      const fnName = match[1].toLowerCase()
      pushRef(functionRefs, fnName, {
        file: filePath,
        line: lineAt(content, match.index),
      })
    }
  }

  return { relationRefs, functionRefs }
}

function formatRef(ref) {
  const rel = path.relative(repoRoot, ref.file).replace(/\\/g, '/')
  return `${rel}:${ref.line}`
}

const sqlFiles = collectSqlFiles()
const codeFiles = collectCodeFiles()
const { relations, functions } = collectDefinitions(sqlFiles)
const { relationRefs, functionRefs } = collectUsage(codeFiles)

const missingRelations = []
for (const [relation, refs] of relationRefs.entries()) {
  if (relations.has(relation)) continue
  if (OPTIONAL_RELATIONS.has(relation)) continue
  missingRelations.push({ relation, refs })
}

const missingFunctions = []
for (const [fnName, refs] of functionRefs.entries()) {
  if (functions.has(fnName)) continue
  missingFunctions.push({ fnName, refs })
}

console.log(`Scanned ${codeFiles.length} code files and ${sqlFiles.length} SQL files`)
console.log(`Discovered ${relations.size} SQL relations and ${functions.size} SQL functions`)
console.log(`Found ${relationRefs.size} relation refs and ${functionRefs.size} RPC refs in code`)

if (missingRelations.length === 0) {
  console.log('Supabase relation contract: OK')
} else {
  console.log('Supabase relation contract: FAILED')
  for (const { relation, refs } of missingRelations.sort((a, b) => a.relation.localeCompare(b.relation))) {
    console.log(`  Missing relation "${relation}" referenced at ${formatRef(refs[0])}`)
  }
}

if (missingFunctions.length === 0) {
  console.log('Supabase RPC contract: OK')
} else {
  console.log('Supabase RPC contract: FAILED')
  for (const { fnName, refs } of missingFunctions.sort((a, b) => a.fnName.localeCompare(b.fnName))) {
    console.log(`  Missing RPC "${fnName}" referenced at ${formatRef(refs[0])}`)
  }
}

if (missingRelations.length > 0 || missingFunctions.length > 0) {
  process.exit(1)
}
