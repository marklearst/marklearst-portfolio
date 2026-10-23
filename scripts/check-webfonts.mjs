import { isWoff2, publicFile, licensedFontPaths } from './webfont-paths.mjs'

const paths = await licensedFontPaths()
const failures = []

for (const path of paths) {
  if (!(await isWoff2(publicFile(path)))) {
    failures.push(`${path}: missing licensed font file or not an original WOFF2`)
  }
}

if (paths.length === 0 || failures.length > 0) {
  console.error('Licensed webfonts are required before building this site.')
  failures.forEach((failure) => console.error(`  ${failure}`))
  console.error('See the README in public/fonts/wotfard or public/fonts/monolisa for setup.')
  process.exitCode = 1
} else {
  console.log(`Verified ${paths.length} licensed webfont files.`)
}
