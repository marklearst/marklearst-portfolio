import { readFile } from 'node:fs/promises'

const css = await readFile(new URL('../src/styles/fonts.css', import.meta.url), 'utf8')
const paths = [...css.matchAll(/url\(['"]?(\/fonts\/wotfard\/[^'"\s)]+)['"]?\)/g)]
const failures = []

for (const [, path] of paths) {
  try {
    const bytes = await readFile(new URL(`../public${path}`, import.meta.url))
    if (bytes.subarray(0, 4).toString('ascii') !== 'wOF2') {
      failures.push(`${path}: expected an original WOFF2 file`)
    }
  } catch {
    failures.push(`${path}: missing licensed font file`)
  }
}

if (paths.length === 0 || failures.length > 0) {
  console.error('Wotfard assets are required before building this site.')
  failures.forEach((failure) => console.error(`  ${failure}`))
  console.error('See public/fonts/wotfard/README.md for setup.')
  process.exitCode = 1
} else {
  console.log(`Verified ${paths.length} Wotfard webfont files.`)
}
