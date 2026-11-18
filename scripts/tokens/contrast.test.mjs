import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { contrast } from '../../src/lib/inspector/brand.ts'
import { contrastRatio } from '../../src/lib/inspector/color.ts'

// The contrast gate. WCAG 2.2 AA, read from the token sources in each theme:
// text holds 4.5:1 on every surface it can sit on, a mark holds 3:1, and a
// label holds 4.5:1 on its fill. A palette change that breaks one fails here,
// before it reaches a page.

const ROOT = path.join(process.cwd(), 'src/tokens')
const read = (name) => JSON.parse(readFileSync(path.join(ROOT, name), 'utf8'))

/** Every token in a DTCG document, as path to raw `$value`. */
function flatten(node, trail = [], out = new Map()) {
  if (!node || typeof node !== 'object') return out
  if ('$value' in node) out.set(trail.join('.'), node.$value)
  for (const [key, value] of Object.entries(node)) if (!key.startsWith('$')) flatten(value, [...trail, key], out)
  return out
}

const foundation = new Map([...flatten(read('base.tokens.json')), ...flatten(read('semantic.tokens.json')), ...flatten(read('component.tokens.json'))])
const THEMES = { dark: foundation, light: new Map([...foundation, ...flatten(read('theme.light.tokens.json'))]) }

function color(tokens, token) {
  let value = tokens.get(token)
  for (let hops = 0; typeof value === 'string' && hops < 8; hops += 1) value = tokens.get(value.slice(1, -1))
  assert.ok(value?.hex, `${token} does not resolve to a color`)
  return value
}

const hex = (tokens, token) => color(tokens, token).hex

// Use the authored sRGB components and alpha, as CSS paints them, without
// rounding the faint zone composite back to an eight-bit hex color.
function rgba(tokens, token) {
  const value = color(tokens, token)
  assert.equal(value.colorSpace, 'srgb', `${token}: update the contrast conversion for this color space`)
  const [r, g, b] = value.components.map((channel) => channel * 255)
  return { r, g, b, a: value.alpha ?? 1 }
}

const over = (front, back) => ({
  r: front.r * front.a + back.r * (1 - front.a),
  g: front.g * front.a + back.g * (1 - front.a),
  b: front.b * front.a + back.b * (1 - front.a),
  a: 1,
})

function baseOf(tokens, token) {
  let path = token
  for (let hops = 0; hops < 8; hops += 1) {
    const value = tokens.get(path)
    assert.ok(value, `${path} is missing`)
    if (typeof value !== 'string') return path
    path = value.slice(1, -1)
  }
  assert.fail(`${token} does not resolve to a base`)
}

const SURFACES = ['semantic.color.surface.canvas', 'semantic.color.surface.base', 'semantic.color.surface.raised']
const TEXT = [
  'semantic.color.ink.primary',
  'semantic.color.ink.secondary',
  'semantic.color.ink.muted',
  'semantic.color.accent.text',
  'semantic.color.status.pass',
  'semantic.color.status.warn',
  'semantic.color.status.fail',
]
const MARKS = ['semantic.color.accent.primary']
/** A label and the fill it sits on. */
const LABELS = [
  ['semantic.color.ink.onAccent', 'semantic.color.accent.primary'],
  ['component.button.accent.text', 'component.button.accent.background'],
  ['component.button.primary.text', 'component.button.primary.background'],
  ['component.inspector.label.text', 'component.inspector.label.background'],
]

const GLUCOSE_ROLES = {
  trace: 'semantic.color.data.trace',
  low: 'semantic.color.status.fail',
  inRange: 'semantic.color.status.pass',
  high: 'semantic.color.status.warn',
  grid: 'semantic.color.border.subtle',
  cursor: 'semantic.color.ink.primary',
  pointOutline: 'semantic.color.surface.base',
}
// GlucoseDemo's target-zone fillOpacity contract; keep this aligned with the SVG.
const GLUCOSE_ZONE_ALPHA = 0.045
// Rebrand rewrites the bases behind both accent roles in both themes.
const BRAND_BASES = new Set(Object.values(THEMES).flatMap((tokens) =>
  ['semantic.color.accent.primary', 'semantic.color.accent.text'].map((token) => baseOf(tokens, token)),
))

for (const [theme, tokens] of Object.entries(THEMES)) {
  const holds = (front, back, floor) => {
    const ratio = contrast(hex(tokens, front), hex(tokens, back))
    assert.ok(ratio >= floor, `${theme}: ${front} on ${back} is ${ratio.toFixed(2)}:1, under ${floor}:1`)
  }

  test(`${theme}: text holds 4.5:1 on every surface`, () => {
    for (const token of TEXT) for (const surface of SURFACES) holds(token, surface, 4.5)
  })

  test(`${theme}: the accent holds 3:1 as a mark on every surface`, () => {
    for (const token of MARKS) for (const surface of SURFACES) holds(token, surface, 3)
  })

  test(`${theme}: a label holds 4.5:1 on its fill`, () => {
    for (const [label, fill] of LABELS) holds(label, fill, 4.5)
  })

  test(`${theme}: glucose trace and cursor hold 3:1 on the chart and its composited in-range zone`, () => {
    const surface = rgba(tokens, 'semantic.color.surface.base')
    const inRange = rgba(tokens, 'component.glucose.inRange')
    const zone = over({ ...inRange, a: inRange.a * GLUCOSE_ZONE_ALPHA }, surface)
    for (const role of ['trace', 'cursor']) {
      const token = `component.glucose.${role}`
      for (const [name, background] of [['surface.base', surface], ['inRange at 0.045 over surface.base', zone]]) {
        const ratio = contrastRatio(rgba(tokens, token), background)
        assert.ok(ratio >= 3, `${theme}: ${token} on ${name} is ${ratio.toFixed(2)}:1, under 3:1`)
      }
    }
  })

  test(`${theme}: glucose point outline separates its marker from the trace at 3:1`, () => {
    const ratio = contrastRatio(rgba(tokens, 'component.glucose.pointOutline'), rgba(tokens, 'component.glucose.trace'))
    assert.ok(ratio >= 3, `${theme}: glucose point outline on trace is ${ratio.toFixed(2)}:1, under 3:1`)
  })

  test(`${theme}: glucose signal swatches hold 3:1 on base and raised surfaces`, () => {
    for (const role of ['low', 'inRange', 'high']) {
      const token = `component.glucose.${role}`
      for (const surface of ['semantic.color.surface.base', 'semantic.color.surface.raised']) {
        const ratio = contrastRatio(rgba(tokens, token), rgba(tokens, surface))
        assert.ok(ratio >= 3, `${theme}: ${token} on ${surface} is ${ratio.toFixed(2)}:1, under 3:1`)
      }
    }
  })

  test(`${theme}: glucose roles retain their meaning and never share a rebrand base`, () => {
    for (const [role, meaning] of Object.entries(GLUCOSE_ROLES)) {
      const token = `component.glucose.${role}`
      assert.equal(tokens.get(token), `{${meaning}}`, `${token} must retain its chart meaning`)
      assert.ok(!BRAND_BASES.has(baseOf(tokens, token)), `${theme}: ${token} would change during a rebrand`)
    }
  })
}
