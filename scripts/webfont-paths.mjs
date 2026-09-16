import { readFile } from 'node:fs/promises'

const WOFF2_MAGIC = 'wOF2'

/** Wotfard URLs declared in the stylesheet, as site-relative paths. */
export async function wotfardPaths() {
  const css = await readFile(new URL('../src/styles/fonts.css', import.meta.url), 'utf8')
  return [...css.matchAll(/url\(['"]?(\/fonts\/wotfard\/[^'"\s)]+)['"]?\)/g)].map(([, path]) => path)
}

/** Absolute file URL under public/ for a site-relative path. */
export function publicFile(path) {
  return new URL(`../public${path}`, import.meta.url)
}

/** Blob pathname for a site-relative path: strip the leading slash. */
export function blobPathname(path) {
  return path.replace(/^\//, '')
}

/** True when the file exists and starts with the WOFF2 signature. */
export async function isWoff2(fileUrl) {
  try {
    const bytes = await readFile(fileUrl)
    return bytes.subarray(0, 4).toString('ascii') === WOFF2_MAGIC
  } catch {
    return false
  }
}
