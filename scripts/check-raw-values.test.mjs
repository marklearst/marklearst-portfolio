import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { classifyClass, classifyDeclaration, scanCss, scanMdx, scanTs } from './check-raw-values.mjs'

const script = fileURLToPath(new URL('./check-raw-values.mjs', import.meta.url))
const tally = (hits) => {
  const out = {}
  for (const { category } of hits) out[category] = (out[category] ?? 0) + 1
  return out
}
const css = (source) => tally(scanCss(source))
const tsx = (source) => tally(scanTs(source, 'input.tsx'))

test('declarations: literals count by category, tokens and geometry do not', () => {
  assert.deepEqual(css(`
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
    .dot { border-radius: 50%; z-index: 1; width: 12px; top: 4px; transition-duration: 0ms; }
  `), { spacing: 2, color: 1, radius: 1, 'line-height': 1, duration: 1, easing: 1, 'z-index': 1 })
})

test('every literal counts, including inside clamp() and calc()', () => {
  assert.deepEqual(css(`
    .a { transition: opacity 180ms ease, transform 500ms ease-out; }
    .b { box-shadow: inset 0 1px 0 rgb(255 255 255 / 9%), 0 3px 12px rgb(0 0 0 / 24%); }
    .c { padding: clamp(20px, 5cqw, 40px); margin-inline: calc(12.5% - 4.5px); }
  `), { duration: 2, easing: 2, shadow: 2, color: 2, spacing: 5 })
})

test('spacing counts every length unit, not just px, rem, and em', () => {
  assert.deepEqual(css('.a { gap: 5vw; padding: 10%; margin: 2dvh 1ch; scroll-margin-top: 7rem; }'), { spacing: 5 })
})

test('colors: hex, every color function including color(), and named colors on color properties', () => {
  assert.deepEqual(css(`
    .a { color: color(srgb 1 0 0); background: color(display-p3 1 0.5 0); border-color: oklch(70% 0.1 200); }
    .b { color: red; background: orange; outline: 1px solid transparent; fill: currentColor; }
    .c { animation-name: orange-pulse; color: rgb(var(--token-color-canvas)); }
  `), { color: 5 })
})

test('the font shorthand counts its weight, size, line height, and family', () => {
  const font = (value) => classifyDeclaration('font', value).font ?? 0
  assert.equal(font('bold var(--text-ui) / var(--leading-ui) Arial'), 2)
  assert.equal(font('400 var(--text-caption)/1.5 var(--font-body)'), 2)
  assert.equal(font('500 var(--text-ui) / var(--leading-ui) var(--font-body)'), 1)
  assert.equal(font('500 clamp(2.75rem, 4.8vw, 4rem)/1.08 var(--font-body)'), 5)
  assert.equal(font('bold 16px "Helvetica Neue", sans-serif'), 3)
  assert.equal(font('inherit'), 0)
})

test('type keywords that pick from a scale count; resets to the font default do not', () => {
  assert.deepEqual(css(`
    .a { font-weight: normal; font-size: medium; font-family: Arial, sans-serif; }
    .b { line-height: normal; letter-spacing: normal; font-family: var(--font-ui); font-family: inherit; }
  `), { 'font-weight': 1, 'font-size': 1, 'font-family': 1 })
})

test('drop shadows count as shadows, with any literal color', () => {
  assert.deepEqual(css(`
    .a { filter: drop-shadow(0 4px 8px var(--color-border-subtle)); }
    .b { filter: drop-shadow(0 4px 8px #000) blur(2px); backdrop-filter: blur(8px); }
  `), { shadow: 2, color: 1 })
})

test('a literal fallback inside var() counts, a var() fallback does not', () => {
  assert.deepEqual(css(`
    .a { color: var(--color-ink-primary, #f3eee8); }
    .b { font: 500 var(--text-ui, 1rem) / var(--leading-ui, 1.5) var(--font-body); }
    .c { color: var(--color-action-icon, var(--color-accent-primary)); }
  `), { fallback: 3, font: 1 })
})

test('breakpoints, @apply, and hand written custom properties count', () => {
  assert.deepEqual(css(`
    :root { --ease-out: cubic-bezier(.22, 1, .36, 1); --duration-feedback: 140ms; --demo-ink: #ffffff; --gutter: 24px; }
    @media (min-width: 640px) { .a { display: grid; } }
    code { @apply font-mono text-sm bg-white/5 px-2 py-1 rounded; }
  `), { easing: 1, duration: 1, color: 1, breakpoint: 1, 'tailwind-type': 1, 'tailwind-color': 1, 'tailwind-scale': 1 })
})

test('raw: exempts a declaration or at-rule on its line or the line after it', () => {
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

test('Tailwind: default scales count, tokens and numeric spacing do not, arbitrary values count as their property', () => {
  const cases = {
    'text-white/50': { 'tailwind-color': 1 },
    '[&>p]:text-white/60': { 'tailwind-color': 1 },
    'hover:bg-black/60': { 'tailwind-color': 1 },
    'text-sm': { 'tailwind-type': 1 },
    'rounded-md': { 'tailwind-scale': 1 },
    'duration-300': { 'tailwind-scale': 1 },
    'text-[11px]': { 'font-size': 1 },
    'text-[#123456]': { color: 1 },
    'p-[24px]': { spacing: 1 },
    'data-[open=true]:p-[3px]': { spacing: 1 },
    'rounded-[8px]': { radius: 1 },
    'p-[var(--spacing,16px)]': { fallback: 1 },
    'min-[837px]:grid': { breakpoint: 1 },
    '[@media(min-width:900px)]:flex': { breakpoint: 1 },
    '[padding:18px]': { spacing: 1 },
    '[font-weight:700]': { 'font-weight': 1 },
    '[font-family:Arial]': { 'font-family': 1 },
    '[color:red]': { color: 1 },
    'p-[var(--spacing-2xl)]': {},
    'border-[var(--color-border-subtle)]': {},
    'w-[calc(100%-2px)]': {},
    'grid-cols-[1fr_2fr]': {},
    'rounded-full': {},
    'px-4': {},
    'gap-1.5': {},
    'space-y-2': {},
    'md:grid': {},
    'text-ink-primary': {},
  }
  for (const [cls, expected] of Object.entries(cases)) assert.deepEqual(classifyClass(cls), expected, cls)
})

test('TypeScript: template expressions are code, not text', () => {
  assert.deepEqual(tsx(`
    const bar = { background: \`linear-gradient(90deg, \${MONOKAI.pink}, \${MONOKAI.orange}, #ffffff)\` }
    const label = \`\${MONOKAI.purple} and orange\`
  `), { color: 1 })
})

test('TypeScript: style entries follow the CSS rules for their property', () => {
  assert.deepEqual(tsx(`
    <div style={{ fontSize: '48px', padding: 0, gap: 12, lineHeight: 0.9, marginTop: -4 }} />
    <div style={{ gap: 'var(--spacing-2xl)', padding: 'var(--spacing-md, 16px)', color: 'rgba(252, 252, 250, 0.5)' }} />
    <div style={{ zIndex: 1, fontFamily: 'monospace', borderRadius: '50%', fontWeight: 'bold', borderTopLeftRadius: 8 }} />
    <div style={{ font: '500 16px/1.5 Arial', filter: 'drop-shadow(0 4px 8px var(--color-border-subtle))', backdropFilter: 'drop-shadow(0 1px 2px #000)' }} />
    <div style={{ transitionDuration: '180ms', transitionTimingFunction: 'ease-out', transitionDelay: '40ms', transition: 'opacity 180ms ease-out' }} />
  `), {
    'font-size': 1, spacing: 2, 'line-height': 1, fallback: 1, color: 2, 'font-family': 1, 'font-weight': 1, radius: 1,
    font: 4, shadow: 2, duration: 3, easing: 2,
  })
})

test('TypeScript: motion options, timers, and SVG color attributes', () => {
  assert.deepEqual(tsx(`
    el.animate(frames, { duration: 220, delay: 0, easing: 'cubic-bezier(.22, 1, .36, 1)' })
    const reset = setTimeout(() => setState('idle'), 1800)
    window.setInterval(tick, 0)
    const icon = <path fill="#a9dc76" stroke="white" strokeWidth="2" d="M0 0h10" />
    const skip = <a href="#add">Skip</a>
  `), { duration: 2, easing: 1, color: 2 })
})

test('TypeScript: class strings count wherever they live, across lines, once each', () => {
  assert.deepEqual(tsx(`
    const base = 'mt-6 [&>p]:text-base [&>p]:text-white/60'
    const panel = cn(
      \`text-white/60
       rounded-md\`,
      open && 'bg-black/60',
    )
    const note = <p className={\`text-sm
      \${className}\`} />
    const swatch = <p className='text-[#123456] p-[var(--spacing,16px)]' />
  `), { 'tailwind-type': 2, 'tailwind-color': 3, 'tailwind-scale': 1, color: 1, fallback: 1 })
})

test('TypeScript: raw: exempts its own line and the line after a standalone comment', () => {
  assert.deepEqual(tsx(`
    // raw: chart gutter matches the SVG viewBox
    const style = { padding: 18 }
    const gap = { gap: 10 } // raw: aligns with the axis label
    const margin = { margin: 6 }
    const art = (
      <svg>
        {/* raw: brand mark artwork */}
        <path
          fill="#a9dc76"
        />
        <path fill="#ffd866" />
      </svg>
    )
  `), { spacing: 1, color: 1 })
})

test('MDX: class attributes count across lines; colors in the writing and in code do not', () => {
  const hits = scanMdx([
    'Patch bumps change a value: `#4ea1ff` to `#3d9aff`.',
    '```json',
    '{ "padding": "12px", "color": "#0066cc" }',
    '```',
    "<div className='text-white/60'>caption</div>",
    '<div className="rounded-md',
    '  text-sm">note</div>',
    '{/* raw: matches the screenshot frame */}',
    "<img className='rounded-lg' />",
  ].join('\n'))
  assert.deepEqual(tally(hits), { 'tailwind-color': 1, 'tailwind-scale': 1, 'tailwind-type': 1 })
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

test('the tree: src root files count; generated output, src/lib, and tests do not', async (t) => {
  const root = await fixture(t, {
    'src/components/Card.module.css': '.a { padding: 12px; }\n',
    'src/mdx-components.tsx': "export const Table = () => <div className='border-white/8' />\n",
    'src/lib/demo.ts': "export const sample = { color: '#33CCFF' }\n",
    'src/tokens/next/tokens.css': ':root { --color-base-black: color(srgb 0.03 0.03 0.03); }\n',
    'src/styles/generated/tokens.css': ':root { --token-color-canvas: 8 8 8; }\n',
    'src/components/Card.test.mjs': "const x = '#ffffff'\n",
  })
  assert.equal(run(root, '--reset').status, 0)
  assert.deepEqual((await baseline(root)).files, {
    'src/components/Card.module.css': { spacing: 1 },
    'src/mdx-components.tsx': { 'tailwind-color': 1 },
  })
})

test('the baseline only goes down', async (t) => {
  const root = await fixture(t, { 'src/components/Card.module.css': '.a { padding: 12px; gap: 8px; }\n' })
  assert.equal(run(root, '--reset').status, 0)
  assert.equal(run(root).status, 0)

  // Trade one value for another: the file's total holds, but a category grows.
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
  assert.equal((await baseline(root)).total, 1)
})
