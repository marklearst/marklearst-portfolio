import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'build.mjs')

const color = (hex) => ({
  colorSpace: 'srgb',
  components: [0, 2, 4].map((i) => Number((parseInt(hex.slice(1 + i, 3 + i), 16) / 255).toFixed(4))),
  hex,
})

function sources(overrides = {}) {
  return {
    'base.tokens.json': {
      color: { $type: 'color', ink: { 100: { $value: color('#F4F4F2') }, 900: { $value: color('#141414') } } },
      duration: { $type: 'duration', instant: { $value: { value: 0, unit: 'ms' } }, quick: { $value: { value: 140, unit: 'ms' } } },
    },
    'semantic.tokens.json': {
      semantic: {
        text: { $type: 'color', $value: '{color.ink.100}' },
        feedback: { $type: 'duration', $value: '{duration.quick}' },
      },
    },
    'component.tokens.json': { component: { button: { text: { $type: 'color', $value: '{semantic.text}' } } } },
    'theme.light.tokens.json': { semantic: { text: { $type: 'color', $value: '{color.ink.900}' } } },
    'motion.reduced.tokens.json': { semantic: { feedback: { $type: 'duration', $value: '{duration.instant}' } } },
    'tokens.resolver.json': {
      version: '2025.10',
      sets: { foundation: { sources: [{ $ref: 'base.tokens.json' }, { $ref: 'semantic.tokens.json' }, { $ref: 'component.tokens.json' }] } },
      modifiers: {
        theme: { default: 'dark', contexts: { dark: [], light: [{ $ref: 'theme.light.tokens.json' }] } },
        motion: { default: 'default', contexts: { default: [], reduced: [{ $ref: 'motion.reduced.tokens.json' }] } },
      },
      resolutionOrder: [{ $ref: '#/sets/foundation' }, { $ref: '#/modifiers/theme' }, { $ref: '#/modifiers/motion' }],
    },
    'css-adapter.json': {
      tailwind: { '--color-text': 'semantic.text' },
      root: { '--duration-feedback': 'semantic.feedback' },
      followSystem: { motion: { reduced: '(prefers-reduced-motion: reduce)' } },
    },
    ...overrides,
  }
}

const config = `export default {
  schemaVersion: 1,
  sources: {
    site: {
      type: 'dtcg',
      file: './src/tokens/generated/site.tokens.json',
      architecture: {
        layers: [
          { id: 'base', roots: ['color', 'duration'], values: 'literal' },
          { id: 'meaning', roots: ['semantic'], values: 'reference', references: ['base'] },
          { id: 'component', roots: ['component'], values: 'reference', references: ['meaning'] },
        ],
      },
      ownership: { default: ['tests'] },
    },
  },
}
`

async function fixture(t, overrides) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-tokens-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(path.join(root, 'src/tokens'), { recursive: true })
  await writeFile(path.join(root, 'primitree.config.ts'), config)
  for (const [name, contents] of Object.entries(sources(overrides))) {
    await writeFile(path.join(root, 'src/tokens', name), JSON.stringify(contents))
  }
  return root
}

const run = (root, ...args) => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' })

test('builds every context into one checked graph and its CSS', async (t) => {
  const root = await fixture(t)
  const result = run(root)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Check passed: 7 tokens, 3 layers, 4 contexts, 0 findings\./)

  const css = await readFile(path.join(root, 'src/styles/generated/tokens.css'), 'utf8')
  assert.match(css, /--semantic-text: var\(--color-ink-100\);/)
  assert.match(css, /\[data-theme='light'\] \{\n {2}--semantic-text: var\(--color-ink-900\);/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\n {2}:root:not\(\[data-motion\]\) \{\n {4}--semantic-feedback: var\(--duration-instant\);/)

  const theme = await readFile(path.join(root, 'src/styles/generated/theme.css'), 'utf8')
  assert.match(theme, /--color-text: var\(--semantic-text\);/)
  assert.match(theme, /--duration-feedback: var\(--semantic-feedback\);/)

  const graph = JSON.parse(await readFile(path.join(root, 'src/tokens/generated/graph.json'), 'utf8'))
  const text = graph.fragment.tokens.find((token) => token.path.join('.') === 'semantic.text')
  assert.deepEqual(text.values.map((value) => value.conditions), [{}, { theme: 'light' }])
  assert.equal(graph.check.exit, 0)
})

test('--check passes on fresh output and names a stale file', async (t) => {
  const root = await fixture(t)
  assert.equal(run(root).status, 0)
  assert.equal(run(root, '--check').status, 0)

  await writeFile(path.join(root, 'src/styles/generated/tokens.css'), '/* edited by hand */')
  const stale = run(root, '--check')
  assert.equal(stale.status, 1)
  assert.match(stale.stderr, /missing or stale:\n- src\/styles\/generated\/tokens\.css/)
})

test('a literal in the meaning layer fails with PT1003, in any context', async (t) => {
  const root = await fixture(t, {
    'theme.light.tokens.json': { semantic: { text: { $type: 'color', $value: color('#141414') } } },
  })
  const result = run(root)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /PT1003 semantic\.text: Layer meaning does not allow this token value form\./)
  assert.match(result.stderr, /Check failed: .* 1 finding\./)
})

test('a component token that skips the meaning layer fails with PT1004', async (t) => {
  const root = await fixture(t, {
    'component.tokens.json': { component: { button: { text: { $type: 'color', $value: '{color.ink.100}' } } } },
  })
  const result = run(root)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /PT1004 component\.button\.text: Layer component cannot reference layer base\./)
})

test('a context can reroute a token but not add one', async (t) => {
  const root = await fixture(t, {
    'theme.light.tokens.json': { semantic: { extra: { $type: 'color', $value: '{color.ink.900}' } } },
  })
  const result = run(root)
  assert.equal(result.status, 2)
  assert.match(result.stderr, /semantic\.extra has no default value/)
})

test('an adapter name must point at a real token', async (t) => {
  const root = await fixture(t, { 'css-adapter.json': { tailwind: { '--color-text': 'semantic.missing' } } })
  const result = run(root)
  assert.equal(result.status, 2)
  assert.match(result.stderr, /--color-text points at semantic\.missing, which does not exist/)
})
