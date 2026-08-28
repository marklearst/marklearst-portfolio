import assert from 'node:assert/strict'
import test from 'node:test'
import { PRIMITREE_DEMO } from './primitree-demo.ts'
import { generatePrimitreeDemo } from './primitree-demo.generate.mjs'
import { getPrimitreeCssExcerpt } from './primitree-demo-display.ts'

const [literal, reference] = PRIMITREE_DEMO.scenarios

test('the two runs differ only in the semantic token value', () => {
  const withReference = structuredClone(literal.tokens)
  withReference.semantic.action.$value = '{color.cyan}'
  assert.deepEqual(withReference, reference.tokens)
  assert.deepEqual(JSON.parse(literal.tokensSource), literal.tokens)
  assert.deepEqual(JSON.parse(reference.tokensSource), reference.tokens)
  assert.equal(literal.tokens.semantic.action.$value.hex, literal.tokens.color.cyan.$value.hex)
})

test('literal color is rejected by the layer rule, not DTCG parsing', () => {
  assert.equal(literal.check.exitCode, 1)
  assert.deepEqual(literal.checkReport.summary, { active: 1, baseline: 0 })
  assert.equal(literal.checkReport.findings[0].ruleId, 'PT1003')
  assert.deepEqual(literal.checkReport.findings[0].path, ['semantic', 'action'])
  assert.equal(literal.build.exitCode, 1)
  assert.deepEqual(literal.files, [])
  assert.equal(literal.css, null)
})

test('reference passes and remains an alias in the emitted CSS', () => {
  assert.equal(reference.check.exitCode, 0)
  assert.deepEqual(reference.checkReport.findings, [])
  assert.equal(reference.build.exitCode, 0)
  assert.deepEqual(reference.files, ['.primitree-manifest.json', 'css/tokens.css'])
  assert.match(reference.css, /--color-cyan: color\(srgb 0\.2 0\.8 1\);/)
  assert.match(reference.css, /--semantic-action: var\(--color-cyan\);/)
  assert.doesNotMatch(reference.build.stdout, /\/Users\/|\/var\/|\/private\//)
})

test('CSS excerpt starts at the rule rather than the comment mentioning :root', () => {
  assert.match(reference.css, /\/\*[^\n]*:root contains default contexts/)
  const excerpt = getPrimitreeCssExcerpt(reference.css)
  assert.equal(excerpt, ':root {\n  --color-cyan: color(srgb 0.2 0.8 1);\n  --semantic-action: var(--color-cyan);\n}\n')
  assert.ok(reference.css.endsWith(excerpt))
  assert.equal(getPrimitreeCssExcerpt(null), null)
  assert.equal(getPrimitreeCssExcerpt('/* no rule */'), '/* no rule */')
})

test('recorded results match a fresh execution of the actual CLI', {
  skip: !process.env.PRIMITREE_DEMO_CLI && 'Set PRIMITREE_DEMO_CLI to the verified CLI entry point to reproduce the runs.',
}, async () => {
  const fresh = await generatePrimitreeDemo(process.env.PRIMITREE_DEMO_CLI)
  assert.deepEqual(fresh, {
    config: PRIMITREE_DEMO.config,
    configSource: PRIMITREE_DEMO.configSource,
    scenarios: PRIMITREE_DEMO.scenarios,
  })
})
