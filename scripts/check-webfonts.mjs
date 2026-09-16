import { isWoff2, publicFile, wotfardPaths } from './webfont-paths.mjs'

const paths = await wotfardPaths()
const failures = []

for (const path of paths) {
  if (!(await isWoff2(publicFile(path)))) {
    failures.push(`${path}: missing licensed font file or not an original WOFF2`)
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
