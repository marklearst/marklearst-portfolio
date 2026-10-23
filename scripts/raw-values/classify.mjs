// Classifies one CSS declaration into raw design value counts. Values are read
// with postcss-value-parser, so units, functions, keywords, and var() calls are
// tokens rather than text matches. CSS, @apply, Tailwind arbitrary values, and
// style objects in TypeScript all go through classifyDeclaration, so the same
// value counts the same way wherever it's written.
import valueParser from 'postcss-value-parser'

const COLOR_FUNCTIONS = new Set(['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color'])
const EASING_FUNCTIONS = new Set(['cubic-bezier', 'steps', 'linear'])
const EASING_WORDS = new Set(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'step-start', 'step-end'])
const SKIPPED_FUNCTIONS = new Set(['url', 'env', 'attr', 'image-set'])
const TIME_UNITS = new Set(['s', 'ms'])
const NOT_LENGTH_UNITS = new Set(['', 's', 'ms', 'deg', 'rad', 'grad', 'turn', 'dpi', 'dpcm', 'dppx', 'x', 'fr', 'hz', 'khz'])
const FONT_SIZE_KEYWORDS = new Set(['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'xxx-large', 'smaller', 'larger'])
const WEIGHT_KEYWORDS = new Set(['normal', 'bold', 'bolder', 'lighter'])
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

function containsVar(nodes) {
  return nodes.some((node) => node.type === 'function' && (node.value.toLowerCase() === 'var' || containsVar(node.nodes)))
}

/** var(--ink, #f3eee8) has a literal fallback. var(--ink, var(--ink-base)) does not. */
function hasLiteralFallback(varNode) {
  const comma = varNode.nodes.findIndex((node) => node.type === 'div' && node.value === ',')
  if (comma === -1) return false
  const rest = varNode.nodes.slice(comma + 1).filter((node) => node.type !== 'space' && node.type !== 'comment')
  return rest.length > 0 && !(rest[0].type === 'function' && rest[0].value.toLowerCase() === 'var')
}

/**
 * Flattens a value into atoms: fallbacks, colors, numbers, words, easing
 * functions, and drop shadows. Token references are opaque, so nothing inside
 * var() counts except a literal fallback.
 */
function atoms(nodes, out = []) {
  for (const node of nodes) {
    if (node.type === 'function') {
      const name = node.value.toLowerCase()
      if (name === 'var') {
        if (hasLiteralFallback(node)) out.push({ kind: 'fallback' })
      } else if (SKIPPED_FUNCTIONS.has(name)) {
        continue
      } else if (COLOR_FUNCTIONS.has(name)) {
        // rgb(var(--token) / 50%) derives from a token; only fully literal colors count.
        if (!containsVar(node.nodes)) out.push({ kind: 'color' })
      } else if (EASING_FUNCTIONS.has(name)) {
        out.push({ kind: 'easing' })
      } else if (name === 'drop-shadow') {
        out.push({ kind: 'drop-shadow', literal: atoms(node.nodes).some((a) => a.kind === 'number' && a.n !== 0) })
        for (const inner of atoms(node.nodes)) if (inner.kind === 'color' || inner.kind === 'fallback' || inner.kind === 'word') out.push(inner)
      } else {
        atoms(node.nodes, out)
      }
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

/**
 * The font shorthand: [style variant weight stretch] size [/ line-height] family.
 * The weight, each literal in the size and line height, and a literal family count.
 */
function classifyFont(nodes) {
  const tokens = nodes.filter((node) => node.type !== 'space' && node.type !== 'comment')
  const slash = tokens.findIndex((node) => node.type === 'div' && node.value === '/')
  let familyStart = tokens.length - 1
  while (familyStart >= 2 && tokens[familyStart - 1].type === 'div' && tokens[familyStart - 1].value === ',') familyStart -= 2
  if (slash !== -1) familyStart = Math.max(familyStart, slash + 2)
  const sizeIndex = slash !== -1 ? slash - 1 : familyStart - 1
  let count = 0
  const read = (node) => atoms([node])[0]
  for (const node of tokens.slice(0, Math.max(sizeIndex, 0))) {
    const a = read(node)
    if ((a?.kind === 'number' && a.unit === '' && a.n !== 0) || (a?.kind === 'word' && WEIGHT_KEYWORDS.has(a.value) && a.value !== 'normal')) count++
  }
  // The size and line height slots can hold clamp() or calc(); each literal inside counts, as it would in font-size.
  if (sizeIndex >= 0) count += atoms([tokens[sizeIndex]]).filter((a) => isNonZero(a) || (a.kind === 'word' && FONT_SIZE_KEYWORDS.has(a.value))).length
  if (slash !== -1 && tokens[slash + 1]) count += atoms([tokens[slash + 1]]).filter(isNonZero).length
  const family = tokens.slice(familyStart).filter((node) => node.type !== 'div')
  if (family.some((node) => node.type === 'string' || (node.type === 'word' && !WIDE_KEYWORDS.has(node.value.toLowerCase())))) count++
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
      add('duration', all.filter((a) => isNonZero(a) && TIME_UNITS.has(a.unit)).length)
      add('easing', all.filter((a) => a.kind === 'easing').length)
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
    case 'radius':
      // 50% makes a circle or an ellipse: geometry, not a radius from the scale.
      add('radius', root.nodes.flatMap((node) => (node.type === 'word' && node.value === '50%' ? [] : atoms([node]))).filter((a) => isNonZero(a) && a.unit !== '').length)
      break
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
