// Downloads the licensed Wotfard files from private Vercel Blob storage when a
// checkout does not already have them. Local checkouts keep the originals in
// public/fonts/wotfard and never touch the network. Vercel builds start from a
// clone without the binaries, so this runs before the font check.
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { get } from '@vercel/blob'
import { blobPathname, isWoff2, publicFile, wotfardPaths } from './webfont-paths.mjs'

const paths = await wotfardPaths()
const missing = []
for (const path of paths) {
  if (!(await isWoff2(publicFile(path)))) missing.push(path)
}

if (missing.length === 0) {
  console.log(`Wotfard webfonts present locally (${paths.length} files); nothing to fetch.`)
  process.exit(0)
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(`${missing.length} Wotfard webfont files are missing and BLOB_READ_WRITE_TOKEN is not set.`)
  console.error('Set the token to fetch them from private Blob storage, or place the originals in public/fonts/wotfard.')
  process.exit(1)
}

const failures = []
for (const path of missing) {
  const target = publicFile(path)
  try {
    const result = await get(blobPathname(path), { access: 'private', useCache: false })
    if (!result || result.statusCode !== 200 || !result.stream) {
      failures.push(`${path}: not found in Blob storage`)
      continue
    }
    const bytes = Buffer.from(await new Response(result.stream).arrayBuffer())
    if (bytes.subarray(0, 4).toString('ascii') !== 'wOF2') {
      failures.push(`${path}: stored file is not a WOFF2`)
      continue
    }
    await mkdir(dirname(fileURLToPath(target)), { recursive: true })
    await writeFile(target, bytes)
    console.log(`Fetched ${path} (${bytes.length} bytes)`)
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (failures.length > 0) {
  console.error('Could not fetch every Wotfard webfont file.')
  failures.forEach((failure) => console.error(`  ${failure}`))
  process.exit(1)
}
