import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'

const nftTarget = path.join(process.cwd(), '.next', 'server', 'middleware.js.nft.json')
const middlewareTarget = path.join(process.cwd(), '.next', 'server', 'middleware.js')

const ensureFile = async (target, content, label) => {
  try {
    await access(target, constants.F_OK)
    return false
  } catch {
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, content)
    console.log(`[build] created missing ${label}`)
    return true
  }
}

const cleanupLegacyStub = async () => {
  try {
    const content = await readFile(middlewareTarget, 'utf8')
    if (content.trim() === 'export {}') {
      await rm(middlewareTarget, { force: true })
      console.log('[build] removed legacy middleware.js stub')
    }
  } catch {
    // No legacy stub present.
  }
}

await ensureFile(nftTarget, `${JSON.stringify({ version: 1, files: [] }, null, 2)}\n`, 'middleware.js.nft.json')
await cleanupLegacyStub()
