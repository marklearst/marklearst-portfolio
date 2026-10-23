// Classifies one CSS declaration into raw design value counts. Values are read
// with postcss-value-parser, so units, functions, keywords, and var() calls are
// tokens rather than text matches. CSS, @apply, Tailwind arbitrary values, MDX
// attributes, and style objects in TypeScript all go through
// classifyDeclaration, so a value counts the same way wherever it's written.
import valueParser from 'postcss-value-parser'

const COLOR_FUNCTIONS = new Set(['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color'])
const EASING_FUNCTIONS = new Set(['cubic-bezier', 'steps', 'linear'])
const EASING_WORDS = new Set(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'step-start', 'step-end'])
const OPAQUE_FUNCTIONS = new Set(['url', 'env', 'attr'])
const TIME_UNITS = new Set(['s', 'ms'])
const NOT_LENGTH_UNITS = new Set(['', 's', 'ms', 'deg', 'rad', 'grad', 'turn', 'dpi', 'dpcm', 'dppx', 'x', 'fr', 'hz', 'khz'])
const FONT_SIZE_KEYWORDS = new Set(['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'xxx-large', 'smaller', 'larger'])
const WEIGHT_KEYWORDS = new Set(['normal', 'bold', 'bolder', 'lighter'])
const SYSTEM_FONTS = new Set(['caption', 'icon', 'menu', 'message-box', 'small-caption', 'status-bar'])
const WIDE_KEYWORDS = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer'])
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

export const NAMED_COLORS = new Set('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'.split(' '))

/** Properties whose named color keywords (red, white) are colors. Elsewhere a word like "orange" is a name. */
const COLOR_PROPERTY = /^(?:color|background(?:-color|-image)?|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?|outline(?:-color)?|fill|stroke|stop-color|flood-color|lighting-color|caret-color|accent-color|column-rule(?:-color)?|text-decoration(?:-color)?|text-emphasis(?:-color)?|box-shadow|text-shadow|scrollbar-color|filter|backdrop-filter|--[\w-]+)$/

/** The decision category a property belongs to, or null for geometry and everything else. */
export function categoryOf(prop) {
  const p = prop.toLowerCase()
  if (p.startsWith('--')) return 'custom'
  if (/^(?:padding|margin)(?:-|$)|^(?:gap|row-gap|column-gap)$|^scroll-(?:padding|margin)(?:-|$)/.test(p)) return 'spacing'
  if (p === 'font') return 'font'
  if (p === 'font-size') return 'font-size'
  if (p === 'line-height') return 'line-height'
  if (p === 'letter-spacing') return 'letter-spacing'
  if (p === 'font-weight') return 'font-weight'
  if (p === 'font-family') return 'font-family'
  if (/radius$/.test(p)) return 'radius'
  if (p === 'box-shadow' || p === 'text-shadow') return 'shadow'
  if (p === 'filter' || p === 'backdrop-filter') return 'filter'
  if (p === 'z-index') return 'z-index'
  if (/^(?:transition|animation)(?:-duration|-delay|-timing-function)?$/.test(p)) return 'motion'
  return null
}

/** True when a property carries a design decision this scanner reads. */
export const isDecisionProperty = (prop) => categoryOf(prop) !== null || COLOR_PROPERTY.test(prop.toLowerCase())

const number = (word) => {
  const parsed = valueParser.unit(word)
  if (!parsed || parsed.number === '' || Number.isNaN(Number(parsed.number))) return null
  return { n: Number(parsed.number), unit: parsed.unit.toLowerCase() }
}

const significant = (nodes) => nodes.filter((node) => node.type !== 'space' && node.type !== 'comment')
const isVar = (node) => node.type === 'function' && node.value.toLowerCase() === 'var'

function containsVar(nodes) {
  return nodes.some((node) => node.type === 'function' && (isVar(node) || containsVar(node.nodes)))
}

/** The nodes after the first top level comma: var(--ink, #fff) gives [#fff]. */
function fallbackOf(varNode) {
  const comma = varNode.nodes.findIndex((node) => node.type === 'div' && node.value === ',')
  return comma === -1 ? null : varNode.nodes.slice(comma + 1)
}

/**
 * Flattens a value into atoms: fallbacks, colors, numbers, words, strings,
 * easing functions, and drop shadows.
 *
 * A token reference is opaque: nothing inside var() is a decision except a
 * literal fallback, which counts once per var() however deep it sits, as in
 * var(--ink, var(--base, #fff)). Colors and numbers under a var(), and the
 * arguments of a color function that reads a token, are derived from the token
 * and don't count. url(), env(), and attr() are skipped whole.
 */
function atoms(nodes, out = [], derived = false) {
  for (const node of nodes) {
    if (node.type === 'function') {
      const name = node.value.toLowerCase()
      if (name === 'var') {
        const fallback = fallbackOf(node)
        if (!fallback) continue
        const first = significant(fallback)[0]
        if (first && !isVar(first)) out.push({ kind: 'fallback' })
        atoms(fallback, out, true)
      } else if (OPAQUE_FUNCTIONS.has(name)) {
        continue
      } else if (COLOR_FUNCTIONS.has(name)) {
        if (containsVar(node.nodes) || derived) atoms(node.nodes, out, true)
        else out.push({ kind: 'color' })
      } else if (EASING_FUNCTIONS.has(name)) {
        if (!derived) out.push({ kind: 'easing' })
        atoms(node.nodes, out, true)
      } else if (name === 'drop-shadow') {
        const inner = atoms(node.nodes, [], derived)
        if (!derived) out.push({ kind: 'drop-shadow', literal: inner.some((a) => a.kind === 'number' && a.n !== 0) })
        for (const a of inner) if (a.kind !== 'number') out.push(a)
      } else {
        atoms(node.nodes, out, derived)
      }
    } else if (derived) {
      continue
    } else if (node.type === 'word') {
      if (HEX.test(node.value)) out.push({ kind: 'color' })
      else {
        const parsed = number(node.value)
        out.push(parsed ? { kind: 'number', ...parsed } : { kind: 'word', value: node.value.toLowerCase() })
      }
    } else if (node.type === 'string') {
      out.push({ kind: 'string', value: node.value })
    }
  }
  return out
}

/** Top level comma separated layers: box-shadow, transition, font-family lists. */
function layers(nodes) {
  const out = [[]]
  for (const node of nodes) {
    if (node.type === 'div' && node.value === ',') out.push([])
    else out.at(-1).push(node)
  }
  return out
}

const isLength = (a) => a.kind === 'number' && a.n !== 0 && !NOT_LENGTH_UNITS.has(a.unit)
const isNonZero = (a) => a.kind === 'number' && a.n !== 0
const isSizeToken = (node) => {
  if (node.type === 'function') return !isVar(node)
  if (node.type !== 'word') return false
  const parsed = number(node.value)
  return parsed ? parsed.unit !== '' : FONT_SIZE_KEYWORDS.has(node.value.toLowerCase())
}

/**
 * The font shorthand: [style variant weight stretch] size [/ line-height] family.
 * The weight, each literal in the size and line height, and a literal family
 * count. The size is the token before the slash when there is one. Otherwise
 * it's the first length, percentage, size keyword, or function, or when the
 * size is a var(), the last var() that still leaves a token for the family.
 */
function classifyFont(nodes) {
  const tokens = significant(nodes)
  if (tokens.length === 1 && tokens[0].type === 'word' && SYSTEM_FONTS.has(tokens[0].value.toLowerCase())) return 1
  const slash = tokens.findIndex((node) => node.type === 'div' && node.value === '/')
  let sizeIndex = slash !== -1 ? slash - 1 : tokens.findIndex(isSizeToken)
  if (sizeIndex === -1) sizeIndex = tokens.findLastIndex((node, i) => isVar(node) && i < tokens.length - 1)
  const familyStart = slash !== -1 ? slash + 2 : sizeIndex + 1

  let count = 0
  for (const node of tokens.slice(0, Math.max(sizeIndex, 0))) {
    const a = atoms([node])[0]
    if (!a) continue
    if (a.kind === 'number' && a.unit === '' && a.n !== 0) count++
    else if (a.kind === 'word' && WEIGHT_KEYWORDS.has(a.value) && a.value !== 'normal') count++
  }
  if (sizeIndex >= 0) count += atoms([tokens[sizeIndex]]).filter((a) => isNonZero(a) || (a.kind === 'word' && FONT_SIZE_KEYWORDS.has(a.value))).length
  if (slash !== -1 && tokens[slash + 1]) count += atoms([tokens[slash + 1]]).filter(isNonZero).length
  const family = atoms(tokens.slice(Math.max(familyStart, 0)))
  if (family.some((a) => a.kind === 'string' || (a.kind === 'word' && !WIDE_KEYWORDS.has(a.value)))) count++
  return count
}

/** Category counts for one declaration: { spacing: 2, color: 1 }. */
export function classifyDeclaration(prop, value) {
  const hits = {}
  const add = (category, n = 1) => { if (n > 0) hits[category] = (hits[category] ?? 0) + n }
  const p = prop.toLowerCase()
  if (WIDE_KEYWORDS.has(value.trim().toLowerCase())) return hits
  const root = valueParser(value)
  const all = atoms(root.nodes)
  const category = categoryOf(p)

  add('fallback', all.filter((a) => a.kind === 'fallback').length)
  add('color', all.filter((a) => a.kind === 'color').length)
  if (COLOR_PROPERTY.test(p)) add('color', all.filter((a) => a.kind === 'word' && NAMED_COLORS.has(a.value)).length)

  switch (category) {
    case 'custom':
      // A custom property has no CSS property to read against, so only the unambiguous decisions count.
      add('duration', all.filter((a) => isNonZero(a) && TIME_UNITS.has(a.unit)).length)
      add('easing', all.filter((a) => a.kind === 'easing').length)
      if (all.length === 1 && all[0].kind === 'word' && EASING_WORDS.has(all[0].value)) add('easing')
      break
    case 'spacing':
      add('spacing', all.filter(isLength).length)
      break
    case 'font':
      add('font', classifyFont(root.nodes))
      break
    case 'font-size':
      add('font-size', all.filter((a) => isNonZero(a) || (a.kind === 'word' && FONT_SIZE_KEYWORDS.has(a.value))).length)
      break
    case 'line-height':
    case 'letter-spacing':
      // "normal" asks for the font's own default, which isn't a decision.
      add(category, all.filter(isNonZero).length)
      break
    case 'font-weight':
      add('font-weight', all.filter((a) => isNonZero(a) || (a.kind === 'word' && WEIGHT_KEYWORDS.has(a.value))).length)
      break
    case 'font-family':
      if (all.some((a) => a.kind === 'string' || (a.kind === 'word' && !WIDE_KEYWORDS.has(a.value)))) add('font-family')
      break
    case 'radius': {
      // A lone 50% makes a circle or an ellipse: geometry, not a radius from the scale.
      const words = significant(root.nodes)
      if (!(words.length === 1 && words[0].type === 'word' && words[0].value === '50%')) add('radius', all.filter((a) => isNonZero(a) && a.unit !== '').length)
      break
    }
    case 'shadow':
      add('shadow', layers(root.nodes).filter((layer) => atoms(layer).some(isNonZero)).length)
      break
    case 'filter':
      add('shadow', all.filter((a) => a.kind === 'drop-shadow' && a.literal).length)
      break
    case 'z-index':
      add('z-index', all.filter((a) => a.kind === 'number' && Number.isInteger(a.n) && Math.abs(a.n) > 1).length)
      break
    case 'motion':
      if (!/timing-function$/.test(p)) add('duration', all.filter((a) => isNonZero(a) && TIME_UNITS.has(a.unit)).length)
      if (!/(?:duration|delay)$/.test(p)) add('easing', all.filter((a) => a.kind === 'easing' || (a.kind === 'word' && EASING_WORDS.has(a.value))).length)
      break
  }
  return hits
}

/**
 * Free text with no property to anchor it, like a string in TypeScript that
 * isn't a style value: literal colors, literal var() fallbacks, and easing
 * functions count. Named colors don't, since "orange" in a sentence is a word.
 */
export function classifyText(text) {
  const hits = {}
  const all = atoms(valueParser(text).nodes)
  for (const kind of ['color', 'fallback', 'easing']) {
    const n = all.filter((a) => a.kind === kind).length
    if (n) hits[kind] = n
  }
  return hits
}

/** Lengths inside @media and @container conditions. */
export function classifyMediaParams(params) {
  return atoms(valueParser(params).nodes).filter(isLength).length
}

/** Merge category counts. */
export function merge(into, from) {
  for (const [category, n] of Object.entries(from)) if (n > 0) into[category] = (into[category] ?? 0) + n
  return into
}
