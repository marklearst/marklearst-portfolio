// Classifies one Tailwind v4 class. A class is parsed into its variants,
// utility, value, and modifier before anything is matched, so the important
// marker, negative prefix, bracketed variants, and opacity or line height
// modifiers can't hide a utility. Default palette and scale utilities count as
// their own categories, since they bypass the site's tokens. Arbitrary values
// and arbitrary properties classify as the CSS they set, so p-[24px] counts
// exactly like padding: 24px.
import { NAMED_COLORS, classifyDeclaration, classifyMediaParams, merge } from './classify.mjs'

const HUE = '(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)'
const PALETTE_VALUE = new RegExp(`^(?:white|black|${HUE}-\\d{2,3})$`)
const TYPE_VALUE = /^(?:xs|sm|base|lg|[2-9]?xl)$/

// Utilities that take a color. For the ambiguous ones (text, border, ring...),
// the value decides between a color and something else.
const COLOR_UTILITIES = new Set(['text', 'bg', 'border', 'border-x', 'border-y', 'border-s', 'border-e', 'border-t', 'border-r', 'border-b', 'border-l', 'divide', 'outline', 'ring', 'ring-offset', 'inset-ring', 'placeholder', 'caret', 'accent', 'fill', 'stroke', 'from', 'via', 'to', 'decoration', 'shadow', 'inset-shadow', 'text-shadow', 'drop-shadow'])
const ALWAYS_COLOR = new Set(['bg', 'placeholder', 'caret', 'accent', 'fill', 'from', 'via', 'to'])

/** Utilities whose default scale values bypass the site's tokens. */
function defaultScale(utility, value) {
  switch (utility) {
    case 'rounded': case 'rounded-t': case 'rounded-r': case 'rounded-b': case 'rounded-l': case 'rounded-s': case 'rounded-e':
    case 'rounded-tl': case 'rounded-tr': case 'rounded-br': case 'rounded-bl': case 'rounded-ss': case 'rounded-se': case 'rounded-es': case 'rounded-ee':
      return value === null || /^(?:xs|sm|md|lg|xl|[234]xl)$/.test(value)
    case 'shadow': case 'inset-shadow': case 'text-shadow': case 'drop-shadow':
      return value === null || /^(?:2xs|xs|sm|md|lg|xl|2xl|inner)$/.test(value)
    case 'duration': case 'delay':
      return /^\d+$/.test(value ?? '')
    case 'ease':
      return /^(?:in|out|in-out|linear)$/.test(value ?? '')
    case 'tracking':
      return /^(?:tighter|tight|normal|wide|wider|widest)$/.test(value ?? '')
    case 'leading':
      // leading-7 is 7 times --spacing, so it moves with the token; the named values are Tailwind's own.
      return /^(?:none|tight|snug|normal|relaxed|loose)$/.test(value ?? '')
    case 'font':
      return /^(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/.test(value ?? '')
    case 'z':
      return /^\d+$/.test(value ?? '')
    case 'animate':
      return /^(?:spin|ping|pulse|bounce)$/.test(value ?? '')
    default:
      return false
  }
}

const COLORISH = /^(?:#|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\()/i
const isColorish = (value) => COLORISH.test(value) || NAMED_COLORS.has(value.toLowerCase())

/** The CSS property an arbitrary value sets, or null for geometry (w-[...], grid-cols-[...], border-[2px]). */
function propertyFor(utility, value, hint) {
  if (hint === 'color') return 'color'
  const color = isColorish(value)
  if (COLOR_UTILITIES.has(utility) && (color || ALWAYS_COLOR.has(utility))) return 'color'
  switch (utility) {
    case 'text': return hint === 'length' || hint === 'percentage' || !hint ? 'font-size' : null
    case 'p': return 'padding'
    case 'px': return 'padding-inline'
    case 'py': return 'padding-block'
    case 'pt': return 'padding-top'
    case 'pr': return 'padding-right'
    case 'pb': return 'padding-bottom'
    case 'pl': return 'padding-left'
    case 'ps': return 'padding-inline-start'
    case 'pe': return 'padding-inline-end'
    case 'm': return 'margin'
    case 'mx': case 'space-x': return 'margin-inline'
    case 'my': case 'space-y': return 'margin-block'
    case 'mt': return 'margin-top'
    case 'mr': return 'margin-right'
    case 'mb': return 'margin-bottom'
    case 'ml': return 'margin-left'
    case 'ms': return 'margin-inline-start'
    case 'me': return 'margin-inline-end'
    case 'gap': return 'gap'
    case 'gap-x': return 'column-gap'
    case 'gap-y': return 'row-gap'
    case 'rounded': return 'border-radius'
    case 'rounded-t': case 'rounded-r': case 'rounded-b': case 'rounded-l': case 'rounded-s': case 'rounded-e':
    case 'rounded-tl': case 'rounded-tr': case 'rounded-br': case 'rounded-bl': case 'rounded-ss': case 'rounded-se': case 'rounded-es': case 'rounded-ee':
      return 'border-radius'
    case 'shadow': case 'inset-shadow': return 'box-shadow'
    case 'text-shadow': return 'text-shadow'
    case 'drop-shadow': return 'filter'
    case 'tracking': return 'letter-spacing'
    case 'leading': return 'line-height'
    case 'font': return hint === 'family-name' ? 'font-family' : hint === 'number' || /^\d/.test(value) ? 'font-weight' : 'font-family'
    case 'duration': return 'transition-duration'
    case 'delay': return 'transition-delay'
    case 'ease': return 'transition-timing-function'
    case 'animate': return 'animation'
    case 'z': return 'z-index'
    default:
      if (/^scroll-p[trblxyse]?$/.test(utility)) return `scroll-padding${sideOf(utility.slice(8))}`
      if (/^scroll-m[trblxyse]?$/.test(utility)) return `scroll-margin${sideOf(utility.slice(8))}`
      return null
  }
}

const sideOf = (side) => ({ '': '', t: '-top', r: '-right', b: '-bottom', l: '-left', x: '-inline', y: '-block', s: '-inline-start', e: '-inline-end' })[side] ?? ''

/** Split on a character outside brackets and parentheses. */
function splitOutside(text, char) {
  const parts = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '[' || c === '(') depth++
    else if (c === ']' || c === ')') depth--
    else if (c === char && depth === 0) {
      parts.push(text.slice(start, i))
      start = i + 1
    }
  }
  parts.push(text.slice(start))
  return parts
}

const unescape = (value) => value.replace(/(?<!\\)_/g, ' ').replace(/\\_/g, '_')

const KNOWN_UTILITIES = new Set([
  ...COLOR_UTILITIES,
  'rounded', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-s', 'rounded-e', 'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl', 'rounded-ss', 'rounded-se', 'rounded-es', 'rounded-ee',
  'duration', 'delay', 'ease', 'tracking', 'leading', 'font', 'z', 'animate',
  'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me', 'space-x', 'space-y', 'gap', 'gap-x', 'gap-y',
])

/**
 * Parse one class: variants, important marker (either end of the utility),
 * negative prefix, the utility name, its value, and a modifier after a slash.
 * A value is bracketed (arbitrary), parenthesized (a variable shorthand), or
 * a plain word from the theme.
 */
export function parseClass(raw) {
  const variants = splitOutside(raw, ':')
  let utility = variants.pop()
  const important = /^!|!$/.test(utility)
  utility = utility.replace(/^!|!$/g, '')
  const negative = utility.startsWith('-')
  if (negative) utility = utility.slice(1)

  const [body, ...modifierParts] = splitOutside(utility, '/')
  const modifier = modifierParts.length ? modifierParts.join('/') : null
  const base = { variants, important, negative, modifier }

  // [property:value]
  const property = body.match(/^\[([a-z-]+|--[\w-]+):(.*)\]$/s)
  if (property) return { ...base, property: property[1], arbitrary: unescape(property[2]) }

  // utility-[value] and utility-(--variable)
  const bracketed = body.match(/^([a-z][\w-]*?)-\[(.*)\]$/s)
  const variable = bracketed ? null : body.match(/^([a-z][\w-]*?)-\((?:([a-z-]+):)?(--[\w-]+)\)$/s)
  if (bracketed) {
    const hinted = bracketed[2].match(/^(color|length|percentage|number|family-name|absolute-size|relative-size|line-width|image|url):(.+)$/s)
    return { ...base, utility: bracketed[1], hint: hinted?.[1] ?? null, arbitrary: unescape(hinted ? hinted[2] : bracketed[2]) }
  }
  if (variable) return { ...base, utility: variable[1], hint: variable[2] ?? null, arbitrary: `var(${variable[3]})` }

  // utility-value: split at the last dash that leaves a known utility, so border-x-red-500 reads as border-x + red-500.
  for (const dash of [...body.matchAll(/-/g)].map((m) => m.index).reverse()) {
    const name = body.slice(0, dash)
    const value = body.slice(dash + 1)
    if (KNOWN_UTILITIES.has(name) && value) return { ...base, utility: name, value }
  }
  return { ...base, utility: body, value: null }
}

/** Breakpoint lengths in a variant: min-[837px]:, max-[600px]:, @min-[400px]:, [@media(min-width:900px)]:. */
function breakpointsIn(variant) {
  const range = variant.match(/^@?(?:min|max)-\[(.+)\](?:\/[\w-]+)?$/)
  const media = variant.match(/^\[@(?:media|container)(.*)\]$/)
  const params = range?.[1] ?? media?.[1]
  return params ? classifyMediaParams(unescape(params)) : 0
}

/** Category counts for one class: { 'tailwind-color': 1 } or { spacing: 1 }; empty when it isn't a decision. */
export function classifyClass(raw) {
  const hits = {}
  const parsed = parseClass(raw)
  for (const variant of parsed.variants) merge(hits, { breakpoint: breakpointsIn(variant) })

  if (parsed.property) return merge(hits, classifyDeclaration(parsed.property, parsed.arbitrary))

  const { utility, value, arbitrary, hint, modifier } = parsed
  if (arbitrary !== undefined) {
    const prop = propertyFor(utility, arbitrary, hint)
    if (prop) merge(hits, classifyDeclaration(prop, prop === 'filter' ? `drop-shadow(${arbitrary})` : arbitrary))
  } else if (value !== null && COLOR_UTILITIES.has(utility) && PALETTE_VALUE.test(value)) {
    merge(hits, { 'tailwind-color': 1 })
  } else if (utility === 'text' && value !== null && TYPE_VALUE.test(value)) {
    merge(hits, { 'tailwind-type': 1 })
  } else if (defaultScale(utility, value)) {
    merge(hits, { 'tailwind-scale': 1 })
  }

  // text-sm/7 and text-[16px]/[22px] carry a line height in the modifier.
  if (utility === 'text' && modifier && (arbitrary !== undefined ? propertyFor(utility, arbitrary, hint) === 'font-size' : TYPE_VALUE.test(value ?? ''))) {
    const bracketed = modifier.match(/^\[(.*)\]$/s)
    if (bracketed) merge(hits, classifyDeclaration('line-height', unescape(bracketed[1])))
    else if (defaultScale('leading', modifier)) merge(hits, { 'tailwind-scale': 1 })
  }
  return hits
}

/** Category counts for a whitespace separated class list, plus the tokens that weren't classes. */
export function classifyClassList(text) {
  const hits = {}
  const rest = []
  for (const token of text.split(/\s+/).filter(Boolean)) {
    const found = classifyClass(token)
    if (Object.keys(found).length) merge(hits, found)
    else rest.push(token)
  }
  return { hits, rest: rest.join(' ') }
}
