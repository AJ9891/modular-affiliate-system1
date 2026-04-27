#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const projectRoot = path.resolve(process.cwd())
const srcRoot = path.join(projectRoot, 'src')
const appRoot = path.join(srcRoot, 'app')
const apiRoot = path.join(appRoot, 'api')

function walk(dir, out = []) {
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

function isCodeFile(filePath) {
  return /\.(ts|tsx|js|jsx)$/.test(filePath)
}

function isRouteGroupSegment(segment) {
  return segment.startsWith('(') && segment.endsWith(')')
}

function toRouteSegment(segment) {
  if (segment.startsWith('[[...') && segment.endsWith(']]')) return ':splat?'
  if (segment.startsWith('[...') && segment.endsWith(']')) return ':splat'
  if (segment.startsWith('[') && segment.endsWith(']')) return ':param'
  return segment
}

function toPageRoute(filePath) {
  const rel = path.relative(appRoot, filePath).replace(/\\/g, '/')
  if (rel === 'page.tsx') return '/'
  if (!rel.endsWith('/page.tsx')) return null

  const withoutFile = rel.slice(0, -'/page.tsx'.length)
  const segments = withoutFile
    .split('/')
    .filter((segment) => segment.length > 0 && !isRouteGroupSegment(segment))
    .map(toRouteSegment)

  return `/${segments.join('/')}`
}

function toApiRoute(filePath) {
  const rel = path.relative(apiRoot, filePath).replace(/\\/g, '/')
  if (rel === 'route.ts') return '/api'
  if (!rel.endsWith('/route.ts')) return null

  const withoutFile = rel.slice(0, -'/route.ts'.length)
  const segments = withoutFile
    .split('/')
    .filter((segment) => segment.length > 0 && !isRouteGroupSegment(segment))
    .map(toRouteSegment)

  return `/api/${segments.join('/')}`
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function routeToRegex(route) {
  const escaped = escapeRegex(route)
    .replace(/\/:splat\\\?/g, '(?:/.*)?')
    .replace(/:splat/g, '.*')
    .replace(/:param/g, '[^/]+')
  return new RegExp(`^${escaped}$`)
}

function normalizePath(value) {
  const trimmed = value.trim()
  if (!trimmed.startsWith('/')) return null
  if (trimmed.startsWith('//')) return null
  if (trimmed.startsWith('/http://') || trimmed.startsWith('/https://')) return null
  const withoutHash = trimmed.split('#')[0]
  const withoutQuery = withoutHash.split('?')[0]
  if (withoutQuery === '') return '/'
  if (withoutQuery !== '/' && withoutQuery.endsWith('/')) return withoutQuery.slice(0, -1)
  return withoutQuery
}

function getStringLiteral(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text
  }
  return null
}

function collectReferences(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const scriptKind = filePath.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : filePath.endsWith('.jsx')
      ? ts.ScriptKind.JSX
      : ts.ScriptKind.TS
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, scriptKind)

  const pageRefs = []
  const apiRefs = []

  function pushRef(target, rawPath, kind, node) {
    const normalized = normalizePath(rawPath)
    if (!normalized) return
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    target.push({
      file: filePath,
      line: line + 1,
      column: character + 1,
      kind,
      raw: rawPath,
      path: normalized,
    })
  }

  function visit(node) {
    if (ts.isJsxAttribute(node) && node.name.text === 'href' && node.initializer) {
      if (ts.isStringLiteral(node.initializer)) {
        pushRef(pageRefs, node.initializer.text, 'href', node)
      } else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
        const text = getStringLiteral(node.initializer.expression)
        if (text) pushRef(pageRefs, text, 'href', node)
      }
    }

    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === 'href') {
      const text = getStringLiteral(node.initializer)
      if (text) pushRef(pageRefs, text, 'prop:href', node)
    }

    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(sourceFile)
      const firstArg = node.arguments[0]
      const firstArgText = firstArg ? getStringLiteral(firstArg) : null

      if (firstArgText) {
        if (callee === 'redirect' || callee === 'router.push') {
          pushRef(pageRefs, firstArgText, callee, node)
        } else if (callee === 'fetch' && firstArgText.startsWith('/api/')) {
          pushRef(apiRefs, firstArgText, 'fetch', node)
        } else if (/^api\.(get|post|put|patch|remove)$/.test(callee) && firstArgText.startsWith('/api/')) {
          pushRef(apiRefs, firstArgText, callee, node)
        }
      }
    }

    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      node.left.getText(sourceFile) === 'window.location.href'
    ) {
      const rightText = getStringLiteral(node.right)
      if (rightText) pushRef(pageRefs, rightText, 'window.location.href', node)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return { pageRefs, apiRefs }
}

const sourceFiles = walk(srcRoot).filter(isCodeFile)
const pageRouteFiles = walk(appRoot).filter((file) => file.endsWith('/page.tsx') || file.endsWith('page.tsx'))
const apiRouteFiles = walk(apiRoot).filter((file) => file.endsWith('/route.ts') || file.endsWith('route.ts'))

const pageRoutes = new Set(pageRouteFiles.map(toPageRoute).filter(Boolean))
const apiRoutes = new Set(apiRouteFiles.map(toApiRoute).filter(Boolean))
const pageRegexes = [...pageRoutes].filter((route) => route.includes(':')).map(routeToRegex)
const apiRegexes = [...apiRoutes].filter((route) => route.includes(':')).map(routeToRegex)

const allPageRefs = []
const allApiRefs = []
for (const filePath of sourceFiles) {
  const { pageRefs, apiRefs } = collectReferences(filePath)
  allPageRefs.push(...pageRefs)
  allApiRefs.push(...apiRefs)
}

function existsRoute(route, routes, dynamicRegexes) {
  if (routes.has(route)) return true
  return dynamicRegexes.some((pattern) => pattern.test(route))
}

const missingPageRefs = allPageRefs.filter((ref) => !ref.path.startsWith('/api/') && !existsRoute(ref.path, pageRoutes, pageRegexes))
const missingApiRefs = allApiRefs.filter((ref) => !existsRoute(ref.path, apiRoutes, apiRegexes))

function uniqueBy(items, keyBuilder) {
  const seen = new Set()
  return items.filter((item) => {
    const key = keyBuilder(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const uniqueMissingPageRefs = uniqueBy(missingPageRefs, (ref) => `${ref.file}:${ref.line}:${ref.path}`)
const uniqueMissingApiRefs = uniqueBy(missingApiRefs, (ref) => `${ref.file}:${ref.line}:${ref.path}`)

console.log(`Scanned ${sourceFiles.length} source files`)
console.log(`Discovered ${pageRoutes.size} page routes and ${apiRoutes.size} API routes`)
console.log(`Validated ${allPageRefs.length} page references and ${allApiRefs.length} API references`)

if (uniqueMissingPageRefs.length === 0) {
  console.log('Page link check: OK')
} else {
  console.log('Page link check: FAILED')
  for (const ref of uniqueMissingPageRefs) {
    const rel = path.relative(projectRoot, ref.file).replace(/\\/g, '/')
    console.log(`  Missing page route ${ref.path} referenced at ${rel}:${ref.line}:${ref.column} (${ref.kind})`)
  }
}

if (uniqueMissingApiRefs.length === 0) {
  console.log('API endpoint check: OK')
} else {
  console.log('API endpoint check: FAILED')
  for (const ref of uniqueMissingApiRefs) {
    const rel = path.relative(projectRoot, ref.file).replace(/\\/g, '/')
    console.log(`  Missing API route ${ref.path} referenced at ${rel}:${ref.line}:${ref.column} (${ref.kind})`)
  }
}

if (uniqueMissingPageRefs.length > 0 || uniqueMissingApiRefs.length > 0) {
  process.exitCode = 1
}
