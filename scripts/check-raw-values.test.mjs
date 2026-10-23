import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { classifyClass, scanCss, scanTsx } from './check-raw-values.mjs'

const script = fileURLToPath(new URL('./check-raw-values.mjs', import.meta.url))
const categories = (hits) => hits.map((hit) => hit.category)
const tally = (hits) => {
  const out = {}
  for (const { category } of hits) out[category] = (out[category] ?? 0) + 1
  return out
}

test('CSS literals count by category, token references do not', () => {
  const hits = scanCss(`
    .card {
      padding: 12px 16px;
      margin: 0 auto;
      gap: var(--spacing-md);
      color: #f3eee8;
      background: var(--color-surface);
      border-radius: 6px;
      font-size: var(--text-caption);
      line-height: 1.5;
      transition: opacity 180ms cubic-bezier(.22, 1, .36, 1);
      z-index: 40;
    }
  `)
  assert.deepEqual(tally(hits), { spacing: 2, color: 1, radius: 1, 'line-height': 1, duration: 1, easing: 1, 'z-index': 1 })
})

test('every literal in a multi value declaration counts', () => {
  const hits = scanCss(`
    .a { transition: opacity 180ms ease, transform 500ms ease-out; }
    .b { box-shadow: inset 0 1px 0 rgb(255 255 255 / 9%), 0 3px 12px rgb(0 0 0 / 24%); }
    .c { font: 500 var(--text-ui) / 1.5 var(--font-body); }
  `)
  assert.deepEqual(tally(hits), { duration: 2, easing: 2, color: 2, shadow: 2, font: 2 })
})

test('named colors count on color properties, not in names or functions', () => {
  const hits = scanCss(`
    .a { color: red; background: orange; border: 1px solid transparent; }
    .b { animation-name: orange-pulse; width: calc(tan(45deg) * 1px); color: currentColor; }
  `)
  assert.deepEqual(tally(hits), { color: 2 })
})

test('font families, drop shadows, and weights count', () => {
  const hits = scanCss(`
    .a { font-family: Arial, sans-serif; font-weight: bold; filter: drop-shadow(0 4px 8px var(--color-border-subtle)); }
    .b { font-family: var(--font-ui); font-family: inherit; filter: blur(2px); }
  `)
  assert.deepEqual(tally(hits), { 'font-family': 1, 'font-weight': 1, shadow: 1 })
})

test('a literal fallback inside var() counts, a var() fallback does not', () => {
  const hits = scanCss(`
    .a { color: var(--color-ink-primary, #f3eee8); }
    .b { font: 500 var(--text-ui, 1rem) / var(--leading-ui, 1.5) var(--font-body); }
    .c { color: var(--color-action-icon, var(--color-accent-primary)); }
  `)
  assert.deepEqual(categories(hits), ['fallback', 'fallback', 'fallback', 'font'])
})

test('geometry stays out: zero, circles, local stacking, offsets', () => {
  const hits = scanCss(`
    .dot { border-radius: 50%; z-index: 1; width: 12px; top: 4px; margin: 0; transition-duration: 0ms; }
  `)
  assert.deepEqual(hits, [])
})

test('a raw: comment exempts the declaration or at-rule that follows or shares its line', () => {
  const hits = scanCss(`
    .chart {
      /* raw: chart gutter matches the SVG viewBox */
      padding: 18px;
      margin-top: 3px; /* raw: optical alignment with the axis label */
      gap: 10px;
    }
    /* raw: matches the GlucoseIQ chart's own breakpoint */
    @media (min-width: 560px) { .a { display: grid; } }
    @media (min-width: 900px) { /* raw: one off for the gallery */ .b { display: grid; } }
    @media (min-width: 640px) { .c { display: grid; } }
  `)
  assert.deepEqual(hits.map((h) => h.text), ['gap: 10px', '@media (min-width: 640px)'])
})

test('breakpoints and hand written custom properties count', () => {
  const hits = scanCss(`
    :root { --ease-out: cubic-bezier(.22, 1, .36, 1); --duration-feedback: 140ms; --demo-ink: #ffffff; --gutter: 24px; }
    @media (min-width: 640px) { .a { display: grid; } }
  `)
  assert.deepEqual(categories(hits), ['easing', 'duration', 'color', 'breakpoint'])
})

test('@apply utilities go through the Tailwind rules', () => {
  const hits = scanCss(`
    code { @apply font-mono text-sm bg-white/5 px-2 py-1 rounded; }
    a { @apply transition-colors duration-200; }
  `)
  assert.deepEqual(tally(hits), { 'tailwind-type': 1, 'tailwind-color': 1, 'tailwind-scale': 2 })
})

test('Tailwind classes: default scales and literals count, tokens and numeric spacing do not', () => {
  const cases = {
    'text-white/50': 'tailwind-color',
    '[&>p]:text-white/60': 'tailwind-color',
    'hover:bg-black/60': 'tailwind-color',
    'text-sm': 'tailwind-type',
    'rounded-md': 'tailwind-scale',
    'duration-300': 'tailwind-scale',
    'text-[11px]': 'tailwind-arbitrary',
    'p-[24px]': 'tailwind-arbitrary',
    'data-[open=true]:p-[3px]': 'tailwind-arbitrary',
    'p-[var(--spacing-2xl)]': null,
    'border-[var(--color-border-subtle)]': null,
    'w-[calc(100%-2px)]': null,
    'grid-cols-[1fr_2fr]': null,
    'rounded-full': null,
    'px-4': null,
    'gap-1.5': null,
    'space-y-2': null,
    'text-ink-primary': null,
  }
  for (const [cls, expected] of Object.entries(cases)) assert.equal(classifyClass(cls), expected, cls)
})

test('TS strings anywhere count, including class lists kept in variables', () => {
  const hits = scanTsx(`
    const zone = { color: '#a9dc76' }
    const base = 'mt-6 [&>p]:text-base [&>p]:text-white/60'
    <path stroke="#78dce8" />
    const timing = { duration: 220, easing: 'cubic-bezier(.22, 1, .36, 1)' }
    <path stroke='#000000' /> // raw: brand mark artwork
  `)
  assert.deepEqual(tally(hits), { color: 2, 'tailwind-type': 1, 'tailwind-color': 1, duration: 1, easing: 1 })
})

test('inline style entries count by category, numbers included, token names excluded', () => {
  const hits = scanTsx(`
    <div style={{ fontSize: '48px', padding: 0, gap: 12, lineHeight: 0.9, marginTop: -4 }} />
    <div style={{ gap: 'var(--spacing-2xl)', padding: 'var(--spacing-md, 16px)', color: 'rgba(252, 252, 250, 0.5)' }} />
    <div style={{ zIndex: 1, fontFamily: 'monospace', transition: 'opacity 180ms ease' }} />
  `)
  assert.deepEqual(tally(hits), { 'font-size': 1, spacing: 2, 'line-height': 1, fallback: 1, color: 1, 'font-family': 1, duration: 1, easing: 1 })
})

test('MDX color examples and fenced code are content, not design values', () => {
  const hits = scanTsx([
    'Patch bumps change a value: `#4ea1ff` to `#3d9aff`.',
    '```json',
    '{ "padding": "12px", "color": "#0066cc" }',
    '```',
    "<div className='text-white/60'>caption</div>",
  ].join('\n'), { mdx: true })
  assert.deepEqual(categories(hits), ['tailwind-color'])
})

async function fixture(t, files) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'raw-values-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  for (const [name, contents] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true })
    await writeFile(path.join(root, name), contents)
  }
  return root
}
const run = (root, ...args) => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' })
const baseline = async (root) => JSON.parse(await readFile(path.join(root, 'scripts/raw-values.baseline.json'), 'utf8'))

test('the baseline only goes down', async (t) => {
  const root = await fixture(t, {
    'src/components/Card.module.css': '.a { padding: 12px; gap: 8px; }\n',
    'src/mdx-components.tsx': "export const Table = () => <div className='border-white/8' />\n",
    'src/lib/demo.ts': "export const sample = '#33CCFF'\n",
  })
  assert.equal(run(root, '--reset').status, 0)
  assert.deepEqual((await baseline(root)).files, {
    'src/components/Card.module.css': { spacing: 2 },
    'src/mdx-components.tsx': { 'tailwind-color': 1 },
  })
  assert.equal(run(root).status, 0)

  // Trade one value for another: the file's count doesn't change, but the per category count does.
  await writeFile(path.join(root, 'src/components/Card.module.css'), '.a { padding: 12px; gap: var(--spacing-sm); color: red; }\n')
  const traded = run(root, '--update')
  assert.equal(traded.status, 1)
  assert.match(traded.stderr, /color: 0 -> 1/)
  assert.match(traded.stderr, /only goes down/)
  assert.deepEqual((await baseline(root)).files['src/components/Card.module.css'], { spacing: 2 })

  await writeFile(path.join(root, 'src/components/Card.module.css'), '.a { padding: 12px; gap: var(--spacing-sm); }\n')
  const lower = run(root)
  assert.equal(lower.status, 1)
  assert.match(lower.stderr, /pnpm tokens:raw --update/)
  assert.equal(run(root, '--growth-only').status, 0)
  assert.equal(run(root, '--update').status, 0)
  assert.equal(run(root).status, 0)
  assert.equal((await baseline(root)).total, 2)
})
