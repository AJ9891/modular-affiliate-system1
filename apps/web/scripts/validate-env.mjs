#!/usr/bin/env node

import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const appRoot = path.resolve(__dirname, '..')

for (const file of ['.env.local', '.env']) {
  dotenv.config({ path: path.join(appRoot, file), override: false })
}

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
]

const oneOfGroups = [
  ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
]

if (process.env.SKIP_ENV_VALIDATION === '1') {
  process.exit(0)
}

const missing = required.filter((key) => !process.env[key])
for (const group of oneOfGroups) {
  const hasAny = group.some((key) => Boolean(process.env[key]))
  if (!hasAny) {
    missing.push(`one of: ${group.join(', ')}`)
  }
}

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error('[env] Missing required environment configuration:')
  for (const key of missing) {
    // eslint-disable-next-line no-console
    console.error(`  - ${key}`)
  }
  process.exit(1)
}

// eslint-disable-next-line no-console
console.log('[env] Environment validation passed')
