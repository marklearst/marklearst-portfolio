// One-time upload of the licensed Wotfard files to private Vercel Blob storage.
// Run from a checkout that has the originals, with BLOB_READ_WRITE_TOKEN set:
//   BLOB_READ_WRITE_TOKEN=... pnpm fonts:upload
// Uploads use private access, so the files are only readable with the token.
import { readFile } from 'node:fs/promises'
import { put } from '@vercel/blob'
import { blobPathname, isWoff2, publicFile, wotfardPaths } from './webfont-paths.mjs'

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN is not set.')
  process.exit(1)
}

const paths = await wotfardPaths()
const failures = []

for (const path of paths) {
  const file = publicFile(path)
  if (!(await isWoff2(file))) {
    failures.push(`${path}: missing or not a WOFF2, nothing uploaded`)
    continue
  }
  try {
    const result = await put(blobPathname(path), await readFile(file), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'font/woff2',
    })
    console.log(`Uploaded ${result.pathname}`)
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (failures.length > 0) {
  failures.forEach((failure) => console.error(failure))
  process.exit(1)
}
