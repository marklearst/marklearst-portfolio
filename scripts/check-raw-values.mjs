#!/usr/bin/env node
// Counts design values written as literals instead of tokens, per file and
// category, and compares the counts with scripts/raw-values.baseline.json.
//
//   node scripts/check-raw-values.mjs             check against the baseline
//   node scripts/check-raw-values.mjs --update    rewrite the baseline
//   node scripts/check-raw-values.mjs --list      print every hit
//   node scripts/check-raw-values.mjs --list spacing
//   node scripts/check-raw-values.mjs --growth-only   fail only on new values (the build uses this)
//
// The baseline is a ratchet. A file that gains a raw value fails the check. A
// file that loses one also fails until the baseline is updated, so the lower
// count is locked in and can't be spent again later.
//
// Only decisions count: color, the type, spacing and radius scales, motion,
// elevation, stacking, and breakpoints. Geometry (sizes, offsets, hairline
// borders, chart coordinates) is left alone. When a literal is intentional,
// say why with a comment containing "raw:" on the same line, or on the line
// before a CSS declaration.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE = path.join(ROOT, 'scripts/raw-values.baseline.json')
const SKIP = [/^src\/styles\/generated\//, /^src\/styles\/(monolisa|fonts)\.css$/, /\.test\.[cm]?[jt]sx?$/]

const LENGTH = /(?<![\w.#-])-?(?:\d*\.)?\d+(?:px|rem|em)\b/g
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(\s*[\d.]/i
const HEX = /#[0-9a-f]{3,8}\b/i
const DURATION = /(?<![\w.-])(?:\d*\.)?\d+m?s\b/
const EASING = /cubic-bezier\(|steps\(|\bease(?:-in|-out|-in-out)?\b|\blinear\b/

/** Remove var() calls, including one level of nested parentheses in a fallback. */
function withoutVars(value) {
  let out = value
  let prev
  do {
    prev = out
    out = out.replace(/var\((?:[^()]|\([^()]*\))*\)/g, '')
  } while (out !== prev)
  return out
}

const nonZeroLength = (value) => (value.match(LENGTH) ?? []).some((n) => parseFloat(n) !== 0)
const isColor = (value) => HEX.test(value) || COLOR_FN.test(value)

/** Literal fallbacks inside var(): var(--ink, #f3eee8). Fallbacks that are themselves var() are fine. */
function literalFallbacks(value) {
  const hits = []
  const re = /var\(\s*--[\w-]+\s*,\s*/g
  let match
  while ((match = re.exec(value))) {
    if (!value.slice(re.lastIndex).trimStart().startsWith('var(')) hits.push(match[0])
  }
  return hits.length
}

function classifyDeclaration(prop, value) {
  const hits = []
  for (let i = literalFallbacks(value); i > 0; i--) hits.push('fallback')
  const v = withoutVars(value)

  if (prop.startsWith('--')) {
    // Hand written custom properties: only the unambiguous decisions count.
    if (isColor(v)) hits.push('color')
    if (DURATION.test(v) && !/^\s*0m?s\s*$/.test(v)) hits.push('duration')
    if (/cubic-bezier\(/.test(v)) hits.push('easing')
    return hits
  }

  if (isColor(v) || (/color|background|border|outline|fill|stroke|shadow/.test(prop) && /\b(?:white|black)\b/.test(v))) hits.push('color')

  if (/^(?:padding|margin)(?:-|$)|^(?:gap|row-gap|column-gap)$|^scroll-(?:padding|margin)/.test(prop)) {
    if (nonZeroLength(v)) hits.push('spacing')
  } else if (prop === 'font-size') {
    if (/\d/.test(v)) hits.push('font-size')
  } else if (prop === 'line-height') {
    if (/\d/.test(v)) hits.push('line-height')
  } else if (prop === 'letter-spacing') {
    if (/[1-9]/.test(v)) hits.push('letter-spacing')
  } else if (prop === 'font-weight') {
    if (/\d/.test(v)) hits.push('font-weight')
  } else if (prop === 'font') {
    if (/\d/.test(v)) hits.push('font')
  } else if (/radius$/.test(prop)) {
    if (v.trim() !== '50%' && (nonZeroLength(v) || /[1-9]\d*%/.test(v))) hits.push('radius')
  } else if (prop === 'box-shadow' || prop === 'text-shadow') {
    if (v.trim() !== 'none' && /\d/.test(v)) hits.push('shadow')
  } else if (prop === 'z-index') {
    if (/\d/.test(v) && !/^\s*-?[01]\s*$/.test(v)) hits.push('z-index')
  }

  if (/^(?:transition|animation)(?:-duration|-delay)?$/.test(prop) && (v.match(new RegExp(DURATION, 'g')) ?? []).some((d) => parseFloat(d) !== 0)) hits.push('duration')
  if (/^(?:transition|animation)(?:-timing-function)?$/.test(prop) && EASING.test(v)) hits.push('easing')
  return hits
}

const isExemption = (node) => node?.type === 'comment' && /\braw:/.test(node.text)

export function scanCss(source, from = 'input.css') {
  const hits = []
  const root = postcss.parse(source, { from })
  root.walkDecls((decl) => {
    const line = (node) => node?.source?.start?.line
    const prev = decl.prev()
    const next = decl.next()
    // A comment before the declaration only counts on its own line, not as the trailing note of the line above.
    const ownLine = isExemption(prev) && line(prev.prev()) !== line(prev)
    const sameLine = isExemption(next) && line(next) === line(decl)
    if (ownLine || sameLine) return
    for (const category of classifyDeclaration(decl.prop, decl.value)) {
      hits.push({ category, line: decl.source?.start?.line ?? 0, text: `${decl.prop}: ${decl.value}` })
    }
  })
  root.walkAtRules(/^(?:media|container)$/, (rule) => {
    if (nonZeroLength(rule.params)) hits.push({ category: 'breakpoint', line: rule.source?.start?.line ?? 0, text: `@${rule.name} ${rule.params}` })
  })
  return hits
}

const TW_PALETTE = /^(?:[\w-]+:)*-?(?:text|bg|border(?:-[trblxy])?|ring|ring-offset|from|via|to|fill|stroke|outline|decoration|divide|placeholder|caret|accent|shadow)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})(?:\/\d+)?$/
const TW_TYPE = /^(?:[\w-]+:)*text-(?:xs|sm|base|lg|[2-9]?xl)$/
const TW_SCALE = /^(?:[\w-]+:)*(?:rounded(?:-[trbl]{1,2})?(?:-(?:xs|sm|md|lg|xl|2xl|3xl))?|shadow(?:-(?:xs|sm|md|lg|xl|2xl|inner))?|duration-\d+|delay-\d+|ease-(?:in|out|in-out|linear)|tracking-(?:tighter|tight|normal|wide|wider|widest)|leading-(?:none|tight|snug|normal|relaxed|loose|\d+)|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|z-\d+)$/
const STYLE_KEY = /\b(fontSize|lineHeight|letterSpacing|fontWeight|padding\w*|margin\w*|gap|rowGap|columnGap|borderRadius|boxShadow|zIndex)\s*:\s*(['"`][^'"`]*[1-9][^'"`]*['"`]|[1-9][\d.]*)/g
const STRING_COLOR = /['"`][^'"`\n]*(?:#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(\s*[\d.])[^'"`\n]*['"`]|\b(?:fill|stroke|stopColor|color)=\{?['"]#[0-9a-fA-F]{3,8}\b/

/** Lines of TS, TSX, or MDX. MDX color literals are content (token examples in prose and code), so only its classes count. */
export function scanTsx(source, { mdx = false } = {}) {
  const hits = []
  let fenced = false
  source.split('\n').forEach((raw, index) => {
    const line = index + 1
    if (/^\s*(?:```|~~~)/.test(raw)) { fenced = !fenced; return }
    if (fenced || /\braw:/.test(raw) || /^\s*(?:\/\/|\/?\*)/.test(raw)) return
    const text = raw.trim()
    const add = (category) => hits.push({ category, line, text: text.slice(0, 140) })

    if (!mdx && STRING_COLOR.test(raw)) add('color')
    for (const m of raw.matchAll(/class(?:Name)?=(?:\{\s*)?(['"`])([^'"`]+)\1/g)) {
      for (const cls of m[2].split(/\s+/).filter(Boolean)) {
        if (TW_PALETTE.test(cls)) add('tailwind-color')
        else if (TW_TYPE.test(cls)) add('tailwind-type')
        else if (TW_SCALE.test(cls)) add('tailwind-scale')
        else if (/\[[^\]]*[\d#][^\]]*\]/.test(cls)) add('tailwind-arbitrary')
      }
    }
    raw.match(STYLE_KEY)?.forEach(() => add('inline-style'))
    if (/\b(?:duration|delay|DURATION|DELAY)\w*\s*[:=]\s*[1-9]\d{1,}\b/.test(raw)) add('duration')
    if (!mdx && /['"`][^'"`]*cubic-bezier\(/.test(raw)) add('easing')
  })
  return hits
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

export function scanTree(root = ROOT) {
  const result = {}
  for (const file of walk(path.join(root, 'src'))) {
    const rel = path.relative(root, file).split(path.sep).join('/')
    if (SKIP.some((re) => re.test(rel))) continue
    let hits
    if (rel.endsWith('.css')) hits = scanCss(readFileSync(file, 'utf8'), rel)
    else if (/\.(?:tsx?|mdx)$/.test(rel) && /^src\/(?:app|components|content)\//.test(rel)) hits = scanTsx(readFileSync(file, 'utf8'), { mdx: rel.endsWith('.mdx') })
    else continue
    if (hits.length) result[rel] = hits
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

function totals(files) {
  const out = {}
  for (const counts of Object.values(files)) for (const [k, n] of Object.entries(counts)) out[k] = (out[k] ?? 0) + n
  return Object.fromEntries(Object.entries(out).sort(([, a], [, b]) => b - a))
}

function main() {
  const args = process.argv.slice(2)
  const hitsByFile = scanTree()
  const files = countHits(hitsByFile)
  const current = totals(files)
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0)

  if (args[0] === '--list') {
    const only = args[1]
    for (const [file, hits] of Object.entries(hitsByFile)) {
      for (const hit of hits) if (!only || hit.category === only) console.log(`${file}:${hit.line}  ${hit.category.padEnd(18)} ${hit.text}`)
    }
    return
  }

  if (args[0] === '--update') {
    writeFileSync(BASELINE, `${JSON.stringify({ total: sum(current), totals: current, files }, null, 2)}\n`)
    console.log(`Raw value baseline updated: ${sum(current)} values in ${Object.keys(files).length} files.`)
    return
  }

  const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'))
  const grew = []
  const shrank = []
  const keys = new Set([...Object.keys(files), ...Object.keys(baseline.files)])
  for (const file of [...keys].sort()) {
    const now = files[file] ?? {}
    const before = baseline.files[file] ?? {}
    for (const category of new Set([...Object.keys(now), ...Object.keys(before)])) {
      const a = before[category] ?? 0
      const b = now[category] ?? 0
      if (b > a) grew.push({ file, category, a, b })
      if (b < a) shrank.push({ file, category, a, b })
    }
  }

  if (grew.length) {
    console.error('New raw design values. Use a token, or mark an intentional literal with a "raw:" comment saying why.')
    for (const { file, category, a, b } of grew) {
      console.error(`  ${file}  ${category}: ${a} -> ${b}`)
      for (const hit of hitsByFile[file].filter((h) => h.category === category)) console.error(`    ${hit.line}: ${hit.text}`)
    }
  }
  if (shrank.length) {
    console.error(`${shrank.length} file and category counts went down. Lock that in with: pnpm tokens:raw --update`)
    for (const { file, category, a, b } of shrank) console.error(`  ${file}  ${category}: ${a} -> ${b}`)
  }
  if (grew.length || (shrank.length && !args.includes('--growth-only'))) {
    process.exitCode = 1
    return
  }
  console.log(shrank.length
    ? `No new raw design values: ${sum(current)} in ${Object.keys(files).length} files, below the baseline.`
    : `Raw design values match the baseline: ${sum(current)} in ${Object.keys(files).length} files.`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
