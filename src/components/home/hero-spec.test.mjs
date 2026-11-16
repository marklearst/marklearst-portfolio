import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { HERO_SPEC } from './hero-spec.ts'

// The blueprint prints token paths on the introduction. This holds those paths
// to the stylesheets: a label is only allowed if the rule it describes reads
// the custom properties that token group stands for.

const HERO = 'src/components/home/Hero.module.css'
const sheet = (file) => readFileSync(path.join(process.cwd(), file), 'utf8')

/** The first rule for a class, outside any media query: the declarations between its braces. */
function rule(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`(?:^|\\n)\\.${escaped} \\{([^}]*)\\}`).exec(css)
  assert.ok(match, `no .${selector} rule`)
  return match[1]
}

/** The custom properties a token group stands for in this site's CSS. */
function propertiesOf(label) {
  const type = /^semantic\.type\.(\w+)$/.exec(label)
  if (type) return [`--text-${type[1]}`, `--leading-${type[1]}`]
  const button = /^component\.button\.(\w+)$/.exec(label)
  if (button) return [`--component-button-${button[1]}-background`, `--component-button-${button[1]}-text`]
  throw new Error(`hero-spec.test.mjs does not know which properties ${label} stands for`)
}

/** `space.6` as the custom property that holds it. */
const spaceVar = (token) => `var(--${token.replace('.', '-')})`

for (const [part, spec] of Object.entries(HERO_SPEC)) {
  test(`the ${part} rule reads the tokens its label names`, () => {
    const declarations = rule(sheet(spec.sheet ?? HERO), spec.rule)
    for (const property of spec.label ? propertiesOf(spec.label) : []) {
      assert.ok(declarations.includes(`var(${property})`), `.${spec.rule} does not read ${property}, which ${spec.label} stands for`)
    }
    for (const [key, token] of [['above', spec.above], ['between', spec.between]]) {
      if (!token) continue
      assert.ok(declarations.includes(`--${key}: ${spaceVar(token)};`), `.${spec.rule} does not set --${key} to ${token}`)
    }
  })
}

test('every gap is named for the token that sets it, in every block that sets one', () => {
  // A narrow screen overrides some gaps. Wherever a gap's value is declared, its name is declared beside it and matches.
  const css = sheet(HERO)
  const blocks = css.match(/\{[^{}]*\}/g) ?? []
  let checked = 0
  for (const block of blocks) {
    for (const [, key, token] of block.matchAll(/--(above|between): var\(--space-(\d+)\);/g)) {
      checked += 1
      assert.ok(block.includes(`--${key}-name: 'space.${token}';`), `a rule sets --${key} to space.${token} without naming it:${block}`)
    }
  }
  assert.ok(checked >= 6, `expected the base rules and the narrow overrides, found ${checked} gap declarations`)
})
