#!/usr/bin/env node
// Solves the accent's tones from one chosen color.
//
//   node scripts/tokens/accent.mjs '#DB1834'
//
// The accent is one hue. `color.brand.500` is chosen by hand. This prints what
// the rule in src/lib/inspector/brand.ts gives for the other two at that hue,
// against the surfaces and the label the token files hold right now, as DTCG
// values ready to paste into src/tokens/base.tokens.json. It writes nothing.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { accentFor, contrast, hueOf } from '../../src/lib/inspector/brand.ts'

const chosen = process.argv[2]
if (!/^#[0-9a-f]{6}$/i.test(chosen ?? '')) {
  console.error("Give the chosen accent as a six digit hex, for example: node scripts/tokens/accent.mjs '#DB1834'")
  process.exit(1)
}

const ROOT = path.join(process.cwd(), 'src/tokens')
const read = (name) => JSON.parse(readFileSync(path.join(ROOT, name), 'utf8'))

function flatten(node, trail = [], out = new Map()) {
  if (!node || typeof node !== 'object') return out
  if ('$value' in node) out.set(trail.join('.'), node.$value)
  for (const [key, value] of Object.entries(node)) if (!key.startsWith('$')) flatten(value, [...trail, key], out)
  return out
}

const dark = new Map([...flatten(read('base.tokens.json')), ...flatten(read('semantic.tokens.json'))])
const light = new Map([...dark, ...flatten(read('theme.light.tokens.json'))])

function hex(tokens, token) {
  let value = tokens.get(token)
  for (let hops = 0; typeof value === 'string' && hops < 8; hops += 1) value = tokens.get(value.slice(1, -1))
  return value.hex
}

const SURFACES = ['semantic.color.surface.canvas', 'semantic.color.surface.base', 'semantic.color.surface.raised']
const surfaces = (tokens) => SURFACES.map((token) => hex(tokens, token))
const label = (tokens) => hex(tokens, 'semantic.color.ink.onAccent')
const hue = hueOf(chosen)

const asText = accentFor(hue, surfaces(dark).map((against) => ({ against, floor: 4.5 })))
const onLight = accentFor(hue, [{ against: label(light), floor: 4.5 }, ...surfaces(light).map((against) => ({ against, floor: 4.5 }))])
const dtcg = ({ hex: value, components }) => ({ $value: { colorSpace: 'srgb', components, hex: value } })
const ratios = (color, against) => against.map((surface) => `${contrast(color, surface).toFixed(2)}:1 on ${surface}`).join(', ')

console.log(`Chosen ${chosen.toUpperCase()}, hue ${hue.toFixed(1)}`)
console.log(`  as a fill on dark:  ${ratios(chosen, surfaces(dark))}, and its label holds ${contrast(label(dark), chosen).toFixed(2)}:1`)
console.log(`\ncolor.brand.300 (the accent as text on dark): ${asText.hex}   ${ratios(asText.hex, surfaces(dark))}`)
console.log(JSON.stringify(dtcg(asText)))
console.log(`\ncolor.brand.700 (the accent on light): ${onLight.hex}   ${ratios(onLight.hex, surfaces(light))}`)
console.log(JSON.stringify(dtcg(onLight)))
