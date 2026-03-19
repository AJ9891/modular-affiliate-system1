import { access, mkdir, writeFile } from 'node:fs/promises'
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

await ensureFile(nftTarget, `${JSON.stringify({ version: 1, files: [] }, null, 2)}\n`, 'middleware.js.nft.json')
await ensureFile(middlewareTarget, 'export {}\n', 'middleware.js')
