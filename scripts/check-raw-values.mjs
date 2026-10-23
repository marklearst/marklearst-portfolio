#!/usr/bin/env node
// Counts design values written as literals instead of tokens, per file and
// category, and compares the counts with scripts/raw-values.baseline.json.
//
//   node scripts/check-raw-values.mjs                check against the baseline
//   node scripts/check-raw-values.mjs --update       lower the baseline after a cleanup
//   node scripts/check-raw-values.mjs --reset        rebuild the baseline from scratch
//   node scripts/check-raw-values.mjs --list         print every hit
//   node scripts/check-raw-values.mjs --list spacing
//   node scripts/check-raw-values.mjs --growth-only  fail only on new values (the build uses this)
//
// The baseline is a ratchet. A file that gains a raw value fails the check. A
// file that loses one also fails until --update lowers the baseline, so the
// lower count is locked in and can't be spent again later. --update refuses
// to raise any count. --reset is only for changes to the scanner, and its
// baseline diff gets reviewed like code.
//
// What counts and what doesn't is the contract in src/tokens/README.md. The
// parsers live in scripts/raw-values: postcss and postcss-value-parser for CSS,
// the TypeScript compiler for TS and TSX, and remark-mdx for MDX.
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanCss } from './raw-values/scan-css.mjs'
import { scanMdx } from './raw-values/scan-mdx.mjs'
import { scanTs } from './raw-values/scan-ts.mjs'

export { classifyClass } from './raw-values/tailwind.mjs'
export { classifyDeclaration } from './raw-values/classify.mjs'
export { scanCss, scanMdx, scanTs }

// Paths resolve from the working directory, the repository root, like the other token scripts.
const ROOT = process.cwd()
const BASELINE = path.join(ROOT, 'scripts/raw-values.baseline.json')

// Out of scope: generated CSS and token output, font faces, demo data and
// engines in src/lib (their colors are content), type declarations, and tests.
const SKIP = [
  /^src\/styles\/generated\//,
  /^src\/styles\/(?:monolisa|fonts)\.css$/,
  /^src\/tokens\//,
  /^src\/lib\//,
  /\.d\.ts$/,
  /\.test\.[cm]?[jt]sx?$/,
]

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

export function scanFile(rel, source) {
  if (rel.endsWith('.css')) return scanCss(source, rel)
  if (rel.endsWith('.mdx')) return scanMdx(source)
  if (/\.tsx?$/.test(rel)) return scanTs(source, rel)
  return null
}

export function scanTree(root = ROOT) {
  const result = {}
  for (const file of walk(path.join(root, 'src'))) {
    const rel = path.relative(root, file).split(path.sep).join('/')
    if (SKIP.some((re) => re.test(rel))) continue
    const hits = scanFile(rel, readFileSync(file, 'utf8'))
    if (hits?.length) result[rel] = hits
  }
  return result
}

export function countHits(hitsByFile) {
  const files = {}
  for (const [file, hits] of Object.entries(hitsByFile).sort(([a], [b]) => a.localeCompare(b))) {
    const counts = {}
    for (const { category } of hits) counts[category] = (counts[category] ?? 0) + 1
    files[file] = Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)))
  }
  return files
}

/** Every file and category whose count differs from the baseline. */
export function compare(files, baselineFiles) {
  const grew = []
  const shrank = []
  const keys = new Set([...Object.keys(files), ...Object.keys(baselineFiles)])
  for (const file of [...keys].sort()) {
    const now = files[file] ?? {}
    const before = baselineFiles[file] ?? {}
    for (const category of new Set([...Object.keys(now), ...Object.keys(before)])) {
      const a = before[category] ?? 0
      const b = now[category] ?? 0
      if (b > a) grew.push({ file, category, a, b })
      if (b < a) shrank.push({ file, category, a, b })
    }
  }
  return { grew, shrank }
}

function totals(files) {
  const out = {}
  for (const counts of Object.values(files)) for (const [k, n] of Object.entries(counts)) out[k] = (out[k] ?? 0) + n
  return Object.fromEntries(Object.entries(out).sort(([a, x], [b, y]) => y - x || a.localeCompare(b)))
}

function main() {
  const args = process.argv.slice(2)
  const hitsByFile = scanTree()
  const files = countHits(hitsByFile)
  const current = totals(files)
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0)
  const summary = `${sum(current)} in ${Object.keys(files).length} files`
  const write = () => {
    mkdirSync(path.dirname(BASELINE), { recursive: true })
    writeFileSync(BASELINE, `${JSON.stringify({ total: sum(current), totals: current, files }, null, 2)}\n`)
  }

  if (args[0] === '--list') {
    const only = args[1]
    for (const [file, hits] of Object.entries(hitsByFile)) {
      for (const hit of hits) if (!only || hit.category === only) console.log(`${file}:${hit.line}  ${hit.category.padEnd(15)} ${hit.text}`)
    }
    return
  }

  if (args[0] === '--reset') {
    write()
    console.log(`Raw value baseline rebuilt: ${summary}. Review the baseline diff before committing it.`)
    return
  }

  const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'))
  const { grew, shrank } = compare(files, baseline.files)

  if (grew.length) {
    console.error('New raw design values. Use a token, or mark an intentional literal with a "raw:" comment saying why.')
    for (const { file, category, a, b } of grew) {
      console.error(`  ${file}  ${category}: ${a} -> ${b}`)
      for (const hit of hitsByFile[file].filter((h) => h.category === category)) console.error(`    ${hit.line}: ${hit.text}`)
    }
    if (args[0] === '--update') console.error('The baseline only goes down, so it was not updated.')
    process.exitCode = 1
    return
  }

  if (args[0] === '--update') {
    write()
    console.log(`Raw value baseline lowered: ${summary}.`)
    return
  }

  if (shrank.length) {
    console.error(`${shrank.length} file and category counts went down. Lock that in with: pnpm tokens:raw --update`)
    for (const { file, category, a, b } of shrank) console.error(`  ${file}  ${category}: ${a} -> ${b}`)
    if (!args.includes('--growth-only')) {
      process.exitCode = 1
      return
    }
    console.log(`No new raw design values: ${summary}, below the baseline.`)
    return
  }
  console.log(`Raw design values match the baseline: ${summary}.`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
