import { access, mkdir, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'

const target = path.join(process.cwd(), '.next', 'server', 'middleware.js.nft.json')

const run = async () => {
  try {
    await access(target, constants.F_OK)
    return
  } catch {
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, JSON.stringify({ version: 1, files: [] }, null, 2))
    console.log('[build] created missing middleware.js.nft.json')
  }
}

await run()
