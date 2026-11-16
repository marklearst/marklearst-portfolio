import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { contrast } from '../../src/lib/inspector/brand.ts'

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

function hex(tokens, token) {
  let value = tokens.get(token)
  for (let hops = 0; typeof value === 'string' && hops < 8; hops += 1) value = tokens.get(value.slice(1, -1))
  assert.ok(value?.hex, `${token} does not resolve to a color`)
  return value.hex
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
}
