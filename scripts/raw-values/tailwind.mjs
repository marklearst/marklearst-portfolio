// Classifies one Tailwind class. Default palette and scale utilities count as
// their own categories, since they bypass the site's tokens. Arbitrary values
// and arbitrary properties are classified by the CSS property they set, so
// p-[24px] counts exactly like padding: 24px.
import { NAMED_COLORS, classifyDeclaration, classifyMediaParams, merge } from './classify.mjs'

const PALETTE = /^(?:text|bg|border(?:-[trblxyse])?|ring|ring-offset|from|via|to|fill|stroke|outline|decoration|divide|placeholder|caret|accent|shadow|inset-shadow)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})(?:\/\d+)?$/
const TYPE = /^text-(?:xs|sm|base|lg|[2-9]?xl)(?:\/\S+)?$/
const SCALE = /^(?:rounded(?:-[trblse]{1,2})?(?:-(?:xs|sm|md|lg|xl|2xl|3xl|4xl))?|shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner))?|inset-shadow-(?:2xs|xs|sm)|drop-shadow(?:-(?:xs|sm|md|lg|xl|2xl))?|text-shadow-(?:2xs|xs|sm|md|lg)|duration-\d+|delay-\d+|ease-(?:in|out|in-out|linear)|tracking-(?:tighter|tight|normal|wide|wider|widest)|leading-(?:none|tight|snug|normal|relaxed|loose|\d+)|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|z-[1-9]\d*)$/

const COLORISH = /^(?:#|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\()/i
const isColorish = (value) => COLORISH.test(value) || NAMED_COLORS.has(value.toLowerCase())

/** The CSS property an arbitrary value sets, by utility prefix. Null for geometry (w-[...], grid-cols-[...]). */
function propertyFor(prefix, value) {
  const color = isColorish(value)
  if (prefix === 'text') return color ? 'color' : 'font-size'
  if (prefix === 'bg') return 'background'
  if (/^(?:border(?:-[trblxyse])?|ring|ring-offset|outline|decoration|divide|accent|caret|fill|stroke|from|via|to|placeholder)$/.test(prefix)) return color ? 'color' : null
  if (/^p[trblxyse]?$/.test(prefix)) return 'padding'
  if (/^(?:m[trblxyse]?|space-[xy])$/.test(prefix)) return 'margin'
  if (/^gap(?:-[xy])?$/.test(prefix)) return 'gap'
  if (/^rounded(?:-[trblse]{1,2})?$/.test(prefix)) return 'border-radius'
  if (prefix === 'shadow' || prefix === 'inset-shadow') return 'box-shadow'
  if (prefix === 'text-shadow') return 'text-shadow'
  if (prefix === 'drop-shadow') return 'filter'
  if (prefix === 'tracking') return 'letter-spacing'
  if (prefix === 'leading') return 'line-height'
  if (prefix === 'font') return /^\d/.test(value) ? 'font-weight' : 'font-family'
  if (prefix === 'duration') return 'transition-duration'
  if (prefix === 'delay') return 'transition-delay'
  if (prefix === 'ease') return 'transition-timing-function'
  if (prefix === 'z') return 'z-index'
  return null
}

/** Split on colons outside brackets and parentheses: md:[&>p]:text-sm. */
function splitVariants(cls) {
  const parts = []
  let depth = 0
  let start = 0
  for (let i = 0; i < cls.length; i++) {
    const c = cls[i]
    if (c === '[' || c === '(') depth++
    else if (c === ']' || c === ')') depth--
    else if (c === ':' && depth === 0) {
      parts.push(cls.slice(start, i))
      start = i + 1
    }
  }
  parts.push(cls.slice(start))
  return parts
}

const unescape = (value) => value.replace(/(?<!\\)_/g, ' ').replace(/\\_/g, '_')

/** Category counts for one class: { 'tailwind-color': 1 } or { spacing: 1 }, empty when it isn't a decision. */
export function classifyClass(raw) {
  const hits = {}
  const cls = raw.replace(/^!|!$/g, '')
  if (!/^[\w@[!-]/.test(cls)) return hits
  const parts = splitVariants(cls)
  const utility = parts.pop().replace(/^-/, '')

  for (const variant of parts) {
    // min-[837px]:, max-[600px]:, @min-[400px]:, [@media(min-width:900px)]:
    const range = variant.match(/^@?(?:min|max)-\[(.+)\]$/)
    const media = variant.match(/^\[@(?:media|container)(.*)\]$/)
    const params = range?.[1] ?? media?.[1]
    if (params) merge(hits, { breakpoint: classifyMediaParams(unescape(params)) })
  }

  const property = utility.match(/^\[([a-z-]+):(.+)\]$/)
  if (property) return merge(hits, classifyDeclaration(property[1], unescape(property[2])))

  if (PALETTE.test(utility)) return merge(hits, { 'tailwind-color': 1 })
  if (TYPE.test(utility)) return merge(hits, { 'tailwind-type': 1 })
  if (SCALE.test(utility)) return merge(hits, { 'tailwind-scale': 1 })

  const arbitrary = utility.match(/^([a-z-]+?)-\[(.+)\](?:\/\S+)?$/)
  if (arbitrary) {
    // A type hint like text-[color:var(--ink)] or text-[length:12px] names the property outright.
    const [, prefix, rawValue] = arbitrary
    const hinted = rawValue.match(/^(color|length|percentage|number|family-name|absolute-size|relative-size):(.+)$/)
    const value = unescape(hinted ? hinted[2] : rawValue)
    const prop = hinted?.[1] === 'color' ? 'color' : propertyFor(prefix, value)
    if (prop) merge(hits, classifyDeclaration(prop, prop === 'filter' ? `drop-shadow(${value})` : value))
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
