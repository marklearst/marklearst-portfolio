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
// to raise any count. --reset is only for changes to this scanner, and its
// baseline diff gets reviewed like code.
//
// Only decisions count: color, the type, spacing and radius scales, motion,
// elevation, stacking, and breakpoints. Each literal value counts once, so a
// declaration with three literals counts three. Geometry (sizes, offsets,
// hairline borders, circles, chart coordinates) is left alone, and so are
// Tailwind's numeric spacing utilities (p-4, gap-6), which resolve through the
// --spacing token. When a literal is intentional, say why with a comment
// containing "raw:" on the same line, or on the line before.
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'

// Paths resolve from the working directory, the repository root, like the other token scripts.
const ROOT = process.cwd()
const BASELINE = path.join(ROOT, 'scripts/raw-values.baseline.json')

// Generated CSS, font faces, demo data and engines in src/lib (their colors are
// demo content), and tests are out of scope.
const SKIP = [/^src\/styles\/generated\//, /^src\/styles\/(?:monolisa|fonts)\.css$/, /^src\/lib\//, /\.test\.[cm]?[jt]sx?$/, /\.d\.ts$/]

const NAMED_COLORS = 'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'
const NAMED_COLOR = new RegExp(`(?<![\\w-])(?:${NAMED_COLORS.split(' ').join('|')})(?![\\w(-])`, 'gi')
const COLOR_PROP = /^(?:color|background(?:-color|-image)?|border(?:-[a-z]+)*|outline(?:-color)?|fill|stroke|stop-color|flood-color|lighting-color|caret-color|accent-color|column-rule(?:-color)?|text-decoration(?:-color)?|text-emphasis(?:-color)?|box-shadow|text-shadow|scrollbar-color|filter|backdrop-filter|--[\w-]+)$/

const HEX = /#[0-9a-f]{3,8}\b/gi
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(\s*[\d.]/gi
const LENGTH = /(?<![\w.#-])-?(?:\d*\.)?\d+(?:px|rem|em)\b/g
const NUMBER = /(?<![\w.#-])-?(?:\d*\.)?\d+(?:[a-z]+|%)?(?![\w-])/gi
const DURATION = /(?<![\w.#-])(?:\d*\.)?\d+m?s\b/g
const EASING = /cubic-bezier\(|steps\(|linear\(|(?<![\w-])(?:ease(?:-in|-out|-in-out)?|linear|step-start|step-end)(?![\w-])/g
const WIDE_KEYWORD = /^\s*(?:inherit|initial|unset|revert|revert-layer)\s*$/

/** Remove var() calls (with nested parentheses in a fallback) and url() calls. */
function withoutVars(value) {
  let out = value.replace(/url\([^)]*\)/g, '')
  let prev
  do {
    prev = out
    out = out.replace(/var\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)/g, '')
  } while (out !== prev)
  return out
}

const count = (value, re) => (value.match(re) ?? []).length
const nonZero = (value, re) => (value.match(re) ?? []).filter((n) => parseFloat(n) !== 0).length

/** Literal fallbacks inside var(): var(--ink, #f3eee8). A var() fallback is fine. */
function literalFallbacks(value) {
  let hits = 0
  for (const match of value.matchAll(/var\(\s*--[\w-]+\s*,\s*/g)) {
    if (!value.slice(match.index + match[0].length).trimStart().startsWith('var(')) hits++
  }
  return hits
}

function colorLiterals(value, prop) {
  return count(value, HEX) + count(value, COLOR_FN) + (COLOR_PROP.test(prop) ? count(value, NAMED_COLOR) : 0)
}

/** Top level comma separated layers, for multi value properties such as box-shadow. */
function layers(value) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++
    else if (value[i] === ')') depth--
    else if (value[i] === ',' && depth === 0) {
      out.push(value.slice(start, i))
      start = i + 1
    }
  }
  out.push(value.slice(start))
  return out
}

/** Category counts for one CSS declaration. */
export function classifyDeclaration(prop, value) {
  const hits = {}
  const add = (category, n = 1) => { if (n > 0) hits[category] = (hits[category] ?? 0) + n }
  add('fallback', literalFallbacks(value))
  const v = withoutVars(value)
  const lower = prop.toLowerCase()

  if (lower.startsWith('--')) {
    // Hand written custom properties: only the unambiguous decisions count.
    add('color', colorLiterals(v, lower))
    add('duration', nonZero(v, DURATION))
    add('easing', count(v, /cubic-bezier\(|steps\(|linear\(/g))
    return hits
  }

  add('color', colorLiterals(v, lower))

  if (/^(?:padding|margin)(?:-|$)|^(?:gap|row-gap|column-gap)$|^scroll-(?:padding|margin)/.test(lower)) add('spacing', nonZero(v, LENGTH))
  else if (lower === 'font-size') add('font-size', nonZero(v, NUMBER))
  else if (lower === 'line-height') add('line-height', nonZero(v, NUMBER))
  else if (lower === 'letter-spacing') add('letter-spacing', nonZero(v, NUMBER))
  else if (lower === 'font-weight') add('font-weight', nonZero(v, NUMBER) + count(v, /(?<![\w-])(?:bold|bolder|lighter)(?![\w-])/g))
  else if (lower === 'font') add('font', nonZero(v, NUMBER))
  else if (lower === 'font-family') { if (v.trim() && !WIDE_KEYWORD.test(v)) add('font-family') }
  else if (/radius$/.test(lower)) add('radius', (v.match(/(?<![\w.#-])(?:\d*\.)?\d+(?:px|rem|em|%)/g) ?? []).filter((n) => parseFloat(n) !== 0 && n !== '50%').length)
  else if (lower === 'box-shadow' || lower === 'text-shadow') add('shadow', layers(v).filter((layer) => /\d/.test(layer) && !/^\s*none\s*$/.test(layer)).length)
  else if (lower === 'filter' || lower === 'backdrop-filter') add('shadow', (v.match(/drop-shadow\([^)]*\)/g) ?? []).filter((s) => /[1-9]/.test(s)).length)
  else if (lower === 'z-index') { if (/\d/.test(v) && !/^\s*-?[01]\s*$/.test(v)) add('z-index') }

  if (/^(?:transition|animation)(?:-duration|-delay)?$/.test(lower)) add('duration', nonZero(v, DURATION))
  if (/^(?:transition|animation)(?:-timing-function)?$/.test(lower)) add('easing', count(v, EASING))
  return hits
}

// Tailwind classes. A variant prefix can be a word (hover:, md:) or a bracketed selector ([&>p]:, data-[open]:).
const VARIANT = String.raw`(?:(?:[\w-]+|[\w-]*\[[^\]\s]*\]):)*!?`
const TW_PALETTE = new RegExp(String.raw`^${VARIANT}-?(?:text|bg|border(?:-[trblxyse])?|ring|ring-offset|from|via|to|fill|stroke|outline|decoration|divide|placeholder|caret|accent|shadow)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})(?:\/\d+)?$`)
const TW_TYPE = new RegExp(String.raw`^${VARIANT}text-(?:xs|sm|base|lg|[2-9]?xl)(?:\/\S+)?$`)
const TW_SCALE = new RegExp(String.raw`^${VARIANT}(?:rounded(?:-[trblse]{1,2})?(?:-(?:xs|sm|md|lg|xl|2xl|3xl|4xl))?|shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner))?|drop-shadow(?:-(?:xs|sm|md|lg|xl|2xl))?|duration-\d+|delay-\d+|ease-(?:in|out|in-out|linear)|tracking-(?:tighter|tight|normal|wide|wider|widest)|leading-(?:none|tight|snug|normal|relaxed|loose|\d+)|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|z-\d+)$`)

/** Tailwind category for one class, or null. Token references inside arbitrary values don't count. */
export function classifyClass(cls) {
  if (TW_PALETTE.test(cls)) return 'tailwind-color'
  if (TW_TYPE.test(cls)) return 'tailwind-type'
  if (TW_SCALE.test(cls)) return 'tailwind-scale'
  // Arbitrary values count on decision utilities only; w-[...], grid-cols-[...] and the like are geometry.
  const base = cls.replace(new RegExp(`^${VARIANT}`), '')
  const arbitrary = base.match(/^-?(?:text|bg|border(?:-[trblxyse])?|ring|ring-offset|outline|fill|stroke|decoration|shadow|drop-shadow|inset-shadow|rounded(?:-[trblse]{1,2})?|p[trblxyse]?|m[trblxyse]?|gap(?:-[xy])?|space-[xy]|tracking|leading|font|duration|delay|ease|z|from|via|to|accent|caret|divide)-\[([^\]]*)\](?:\/\S+)?$/)
  if (arbitrary) {
    const inner = arbitrary[1].replace(/_/g, ' ')
    if (literalFallbacks(inner) || /[\d#]/.test(withoutVars(inner))) return 'tailwind-arbitrary'
  }
  return null
}

const isExemption = (node) => node?.type === 'comment' && /\braw:/.test(node.text)
const lineOf = (node) => node?.source?.start?.line

/** Exempt when a raw: comment sits on its own line just before the node, or on the node's line. */
function exempt(node) {
  const prev = node.prev()
  if (isExemption(prev) && lineOf(prev.prev()) !== lineOf(prev)) return true
  const next = node.type === 'atrule' ? node.first : node.next()
  return isExemption(next) && lineOf(next) === lineOf(node)
}

export function scanCss(source, from = 'input.css') {
  const hits = []
  const root = postcss.parse(source, { from })
  const push = (category, n, node, text) => { for (let i = 0; i < n; i++) hits.push({ category, line: lineOf(node) ?? 0, text }) }
  root.walk((node) => {
    if (node.type === 'decl') {
      if (exempt(node)) return
      for (const [category, n] of Object.entries(classifyDeclaration(node.prop, node.value))) push(category, n, node, `${node.prop}: ${node.value}`)
    } else if (node.type === 'atrule' && /^(?:media|container)$/.test(node.name)) {
      if (!exempt(node)) push('breakpoint', nonZero(node.params, LENGTH), node, `@${node.name} ${node.params}`)
    } else if (node.type === 'atrule' && node.name === 'apply') {
      if (exempt(node)) return
      for (const cls of node.params.split(/\s+/).filter(Boolean)) {
        const category = classifyClass(cls)
        if (category) push(category, 1, node, `@apply ${node.params}`)
      }
    }
  })
  return hits
}

const STYLE_KEYS = 'fontSize|lineHeight|letterSpacing|fontWeight|fontFamily|padding\\w*|margin\\w*|gap|rowGap|columnGap|border\\w*Radius|boxShadow|textShadow|zIndex|color|background(?:Color)?|borderColor|outlineColor|fill|stroke|transition|animation\\w*'
const STYLE_ENTRY = new RegExp(`\\b(${STYLE_KEYS})\\s*:\\s*(?:(['"\`])((?:(?!\\2).)*)\\2|(-?(?:\\d*\\.)?\\d+)(?![\\w.]))`, 'g')
const STRING = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g

const STYLE_CATEGORY = [
  [/^(?:padding|margin)\w*$|^(?:gap|rowGap|columnGap)$/, 'spacing'],
  [/^fontSize$/, 'font-size'],
  [/^lineHeight$/, 'line-height'],
  [/^letterSpacing$/, 'letter-spacing'],
  [/^fontWeight$/, 'font-weight'],
  [/^border\w*Radius$/, 'radius'],
  [/^(?:box|text)Shadow$/, 'shadow'],
  [/^zIndex$/, 'z-index'],
]

/**
 * Category counts for one style or object entry, such as { padding: '80px' } or
 * { lineHeight: 0.9 }. Each entry lands in the same category its CSS property would.
 */
function styleEntryHits(key, quoted, number) {
  const hits = {}
  const add = (category, n = 1) => { if (n > 0) hits[category] = (hits[category] ?? 0) + n }
  const category = STYLE_CATEGORY.find(([re]) => re.test(key))?.[1]
  if (number !== undefined) {
    const n = parseFloat(number)
    if (n !== 0 && !(key === 'zIndex' && Math.abs(n) <= 1) && category) add(category)
    return hits
  }
  add('fallback', literalFallbacks(quoted))
  const v = withoutVars(quoted)
  if (/^(?:color|background(?:Color)?|borderColor|outlineColor|fill|stroke)$/.test(key)) add('color', colorLiterals(v, 'color'))
  else if (key === 'fontFamily') add('font-family', v.trim() && !WIDE_KEYWORD.test(v) ? 1 : 0)
  else if (/^(?:transition|animation)/.test(key)) {
    add('duration', nonZero(v, DURATION))
    add('easing', count(v, EASING))
  } else if (category === 'shadow') {
    add('shadow', layers(v).filter((layer) => /\d/.test(layer) && !/^\s*none\s*$/.test(layer)).length)
    add('color', colorLiterals(v, 'box-shadow'))
  } else if (category === 'z-index') {
    if (/\d/.test(v) && !/^\s*-?[01]\s*$/.test(v)) add('z-index')
  } else if (category) add(category, nonZero(v, NUMBER))
  return hits
}

/** Lines of TS, TSX, or MDX. MDX color literals are content (token examples in prose and code), so only its classes count. */
export function scanTsx(source, { mdx = false } = {}) {
  const hits = []
  let fenced = false
  source.split('\n').forEach((raw, index) => {
    const line = index + 1
    if (/^\s*(?:```|~~~)/.test(raw)) { fenced = !fenced; return }
    if (fenced || /\braw:/.test(raw) || /^\s*(?:\/\/|\/?\*)/.test(raw)) return
    const text = raw.trim().slice(0, 140)
    const add = (category, n = 1) => { for (let i = 0; i < n; i++) hits.push({ category, line, text }) }
    // MDX prose keeps inline code: drop it so `#4ea1ff` in a sentence isn't read as a string.
    const code = mdx ? raw.replace(/`[^`\n]*`/g, '') : raw

    // Object entries first, so their strings aren't counted twice below.
    const styled = new Set()
    for (const m of code.matchAll(STYLE_ENTRY)) {
      for (const [category, n] of Object.entries(styleEntryHits(m[1], m[3], m[4]))) add(category, n)
      if (m[3] !== undefined) styled.add(m.index + m[0].length - m[3].length - 1)
    }

    for (const m of code.matchAll(STRING)) {
      const body = m[1] === '`' ? m[2].replace(/\$\{[^}]*\}/g, ' ') : m[2]
      if (!styled.has(m.index + 1)) {
        if (!mdx) add('color', count(withoutVars(body), HEX) + count(withoutVars(body), COLOR_FN))
        add('fallback', literalFallbacks(body))
        if (!mdx) add('easing', count(body, /cubic-bezier\(|steps\(/g))
      }
      for (const cls of body.split(/\s+/).filter(Boolean)) {
        const category = classifyClass(cls)
        if (category) add(category)
      }
    }
    if (!mdx) add('duration', count(code, /\b(?:duration|delay|DURATION|DELAY)\w*\s*[:=]\s*[1-9]\d{1,}\b/g))
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
    else if (/\.(?:tsx?|mdx)$/.test(rel)) hits = scanTsx(readFileSync(file, 'utf8'), { mdx: rel.endsWith('.mdx') })
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
  return Object.fromEntries(Object.entries(out).sort(([, a], [, b]) => b - a))
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
      for (const hit of hits) if (!only || hit.category === only) console.log(`${file}:${hit.line}  ${hit.category.padEnd(18)} ${hit.text}`)
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
