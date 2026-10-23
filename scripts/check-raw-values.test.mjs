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
const mdx = (lines) => tally(scanMdx(lines.join('\n')))
const declaration = (prop, value) => classifyDeclaration(prop, value)

// CSS values

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

test('spacing counts every length unit and percentage', () => {
  assert.deepEqual(css('.a { gap: 5vw; padding: 10%; margin: 2dvh 1ch; scroll-margin-top: 7rem; }'), { spacing: 5 })
})

test('colors: hex, every color function including color(), and named colors on color properties', () => {
  assert.deepEqual(css(`
    .a { color: color(srgb 1 0 0); background: color(display-p3 1 0.5 0); border-color: oklch(70% 0.1 200); }
    .b { color: red; background: orange; outline: 1px solid transparent; fill: currentColor; }
    .c { animation-name: orange-pulse; color: rgb(var(--token-color-canvas)); }
    .d { background-image: image-set(linear-gradient(red, blue) 1x); background: url(/orange.png); }
    .e { color: color-mix(in srgb, var(--a), white 10%); }
  `), { color: 8 })
})

test('a literal var() fallback counts once at any depth; what it derives from a token does not', () => {
  assert.deepEqual(declaration('color', 'var(--color-ink-primary, #f3eee8)'), { fallback: 1 })
  assert.deepEqual(declaration('color', 'var(--color-action-icon, var(--color-accent-primary))'), {})
  assert.deepEqual(declaration('color', 'var(--ink, var(--base-ink, #fff))'), { fallback: 1 })
  assert.deepEqual(declaration('color', 'rgb(var(--channels, 255 0 0))'), { fallback: 1 })
  assert.deepEqual(declaration('padding', 'var(--a, calc(var(--b, 4px) + 1px))'), { fallback: 2 })
  assert.deepEqual(declaration('font', '500 var(--text-ui, 1rem) / var(--leading-ui, 1.5) var(--font-body)'), { fallback: 2, font: 1 })
})

test('the font shorthand follows its grammar: weight, size, line height, family', () => {
  const font = (value) => declaration('font', value).font ?? 0
  assert.equal(font('bold var(--text-ui) / var(--leading-ui) Arial'), 2)
  assert.equal(font('400 var(--text-caption)/1.5 var(--font-body)'), 2)
  assert.equal(font('500 var(--text-ui) / var(--leading-ui) var(--font-body)'), 1)
  assert.equal(font('500 clamp(2.75rem, 4.8vw, 4rem)/1.08 var(--font-body)'), 5)
  assert.equal(font('bold 16px "Helvetica Neue", sans-serif'), 3)
  assert.equal(font('16px Times New Roman'), 2)
  assert.equal(font('16px Gill Sans'), 2)
  assert.equal(font('var(--text-body) Times New Roman'), 1)
  assert.equal(font('var(--w) 16px Arial'), 2)
  assert.equal(font('500 var(--text-ui) var(--font-body)'), 1)
  assert.equal(font('bold var(--text-ui) Arial'), 2)
  assert.equal(font('italic small-caps 12px/30px Georgia, serif'), 3)
  assert.equal(font('menu'), 1)
  assert.equal(font('inherit'), 0)
})

test('type keywords that pick from a scale count; resets to the font default do not', () => {
  assert.deepEqual(css(`
    .a { font-weight: normal; font-size: medium; font-family: Arial, sans-serif; }
    .b { line-height: normal; letter-spacing: normal; font-family: var(--font-ui); font-family: inherit; }
  `), { 'font-weight': 1, 'font-size': 1, 'font-family': 1 })
})

test('radius: a lone 50% is a circle; 50% beside a length is a decision', () => {
  assert.deepEqual(declaration('border-radius', '50%'), {})
  assert.deepEqual(declaration('border-radius', '50% 12px'), { radius: 2 })
  assert.deepEqual(declaration('border-radius', '8px / 4px'), { radius: 2 })
})

test('shadows: layers, drop shadows, and their literal colors', () => {
  assert.deepEqual(css(`
    .a { filter: drop-shadow(0 4px 8px var(--color-border-subtle)); }
    .b { filter: drop-shadow(0 4px 8px #000) blur(2px); backdrop-filter: blur(8px); }
    .c { box-shadow: var(--shadow-1), 0 0 0 1px red; text-shadow: none; }
  `), { shadow: 3, color: 2 })
})

test('custom properties count only the unambiguous decisions: colors, durations, easings', () => {
  assert.deepEqual(css(`
    :root { --ease-out: cubic-bezier(.22, 1, .36, 1); --duration-feedback: 140ms; --demo-ink: #ffffff; --gutter: 24px; --panel-easing: ease-in-out; --x: linear-gradient(red, blue); }
  `), { easing: 2, duration: 1, color: 3 })
})

test('breakpoints and @apply count', () => {
  assert.deepEqual(css(`
    @media (min-width: 640px) { .a { display: grid; } }
    @container (min-width: 30rem) { .b { display: grid; } }
    @custom-media --wide (min-width: 1060px);
    code { @apply font-mono text-sm bg-white/5 px-2 py-1 rounded; }
  `), { breakpoint: 3, 'tailwind-type': 1, 'tailwind-color': 1, 'tailwind-scale': 1 })
})

test('CSS raw: covers its own line, or the next line when it stands alone; blank lines break the link', () => {
  const hits = scanCss(`
    .chart {
      /* raw: chart gutter matches the SVG viewBox */
      padding: 18px;
      margin-top: 3px; /* raw: optical alignment with the axis label */
      /* raw: lead comment on the same line */ margin-bottom: 5px;
      gap: 10px;
      /* raw: left behind by a deleted declaration */

      row-gap: 7px;
    }
    /* raw: matches the GlucoseIQ chart's own breakpoint */
    @media (min-width: 560px) { .a { display: grid; } }
    @media (min-width: 900px) { /* raw: one off for the gallery */ .b { display: grid; } }
    @media (min-width: 640px) { .c { display: grid; } }
    code { @apply text-sm; /* raw: intentional */ }
    pre { @apply text-xs; }
    /* raw: the whole legacy block, migrating in phase 4 */
    .legacy { padding: 18px; gap: 4px; .nested { margin: 2px; } }
    /* raw: the whole media block */
    @media (min-width: 700px) { .a { padding: 6px; } @supports (display: grid) { .b { gap: 3px; } } }
    .after { padding: 9px; }
    .opener { /* raw: opens the block, so it covers nothing inside */
      padding: 11px;
    }
    @media (min-width: 720px) { /* raw: covers the breakpoint only */
      .c { padding: 13px; }
    }
  `)
  assert.deepEqual(hits.map((h) => h.text), ['gap: 10px', 'row-gap: 7px', '@media (min-width: 640px)', '@apply text-xs', 'padding: 9px', 'padding: 11px', 'padding: 13px'])
})

// Tailwind classes

test('Tailwind: default scales count, site tokens and numeric spacing do not', () => {
  const cases = {
    'text-white/50': { 'tailwind-color': 1 },
    'border-x-red-500': { 'tailwind-color': 1 },
    'shadow-black/5': { 'tailwind-color': 1 },
    'ring-offset-white': { 'tailwind-color': 1 },
    'text-sm': { 'tailwind-type': 1 },
    'text-2xl': { 'tailwind-type': 1 },
    'rounded': { 'tailwind-scale': 1 },
    'rounded-md': { 'tailwind-scale': 1 },
    'rounded-tl-lg': { 'tailwind-scale': 1 },
    'shadow': { 'tailwind-scale': 1 },
    'inset-shadow-sm': { 'tailwind-scale': 1 },
    'duration-300': { 'tailwind-scale': 1 },
    'ease-out': { 'tailwind-scale': 1 },
    'tracking-wide': { 'tailwind-scale': 1 },
    'leading-tight': { 'tailwind-scale': 1 },
    'font-medium': { 'tailwind-scale': 1 },
    'z-50': { 'tailwind-scale': 1 },
    'animate-spin': { 'tailwind-scale': 1 },
    'rounded-full': {},
    'rounded-none': {},
    'shadow-none': {},
    'leading-7': {},
    'px-4': {},
    'gap-1.5': {},
    'space-y-2': {},
    'border-2': {},
    'from-10%': {},
    'font-mono': {},
    'font-body': {},
    'text-ink-primary': {},
    'bg-surface': {},
    'text-monokai-cyan/80': {},
    'md:grid': {},
    'grid-cols-3': {},
  }
  for (const [cls, expected] of Object.entries(cases)) assert.deepEqual(classifyClass(cls), expected, cls)
})

test('Tailwind: variants, important, negatives, and modifiers never hide a utility', () => {
  const cases = {
    '[&>p]:text-white/60': { 'tailwind-color': 1 },
    'hover:bg-black/60': { 'tailwind-color': 1 },
    'group-data-[state=open]:text-sm': { 'tailwind-type': 1 },
    'supports-[display:grid]:grid': {},
    '*:text-sm': { 'tailwind-type': 1 },
    '@sm:text-lg': { 'tailwind-type': 1 },
    'hover:!bg-white/60': { 'tailwind-color': 1 },
    'md:!text-sm': { 'tailwind-type': 1 },
    '!rounded-md': { 'tailwind-scale': 1 },
    'md:p-[24px]!': { spacing: 1 },
    '-mt-[4px]': { spacing: 1 },
    '-mt-4': {},
    'bg-white/[0.08]': { 'tailwind-color': 1 },
    'hover:bg-red-500/[50%]': { 'tailwind-color': 1 },
    'text-red-500/[var(--alpha)]': { 'tailwind-color': 1 },
    'text-[#fff]/50': { color: 1 },
    'text-sm/7': { 'tailwind-type': 1 },
    'text-sm/tight': { 'tailwind-type': 1, 'tailwind-scale': 1 },
    'text-sm/[1.4]': { 'tailwind-type': 1, 'line-height': 1 },
    'text-[16px]/[22px]': { 'font-size': 1, 'line-height': 1 },
    'min-[837px]:grid': { breakpoint: 1 },
    'max-[600px]:p-[3px]': { breakpoint: 1, spacing: 1 },
    '@min-[400px]:flex': { breakpoint: 1 },
    '[@media(min-width:900px)]:flex': { breakpoint: 1 },
  }
  for (const [cls, expected] of Object.entries(cases)) assert.deepEqual(classifyClass(cls), expected, cls)
})

test('Tailwind: arbitrary values and properties count as the CSS they set', () => {
  const cases = {
    'text-[11px]': { 'font-size': 1 },
    'text-[#123456]': { color: 1 },
    'text-[length:12px]': { 'font-size': 1 },
    'text-[color:var(--ink)]': {},
    'text-[length:var(--text-caption)]': {},
    'p-[24px]': { spacing: 1 },
    'p-[calc(var(--x)+4px)]': { spacing: 1 },
    'p-[var(--spacing-2xl)]': {},
    'p-(--spacing-2xl)': {},
    'p-[var(--spacing,16px)]': { fallback: 1 },
    'scroll-mt-[24px]': { spacing: 1 },
    'scroll-p-[12px]': { spacing: 1 },
    'space-x-[6px]': { spacing: 1 },
    'rounded-[8px]': { radius: 1 },
    'rounded-[50%]': {},
    'shadow-[0_4px_8px_rgba(0,0,0,0.2)]': { shadow: 1, color: 1 },
    'shadow-[#000]': { color: 1 },
    'drop-shadow-[0_4px_8px_#000]': { shadow: 1, color: 1 },
    'inset-ring-[#fff]': { color: 1 },
    'border-[#fff]': { color: 1 },
    'border-[2px]': {},
    'border-[var(--color-border-subtle)]': {},
    'ring-[3px]': {},
    'bg-[url(/x.png)]': {},
    'bg-[linear-gradient(red,blue)]': { color: 2 },
    'bg-(--brand)': {},
    'font-[Arial]': { 'font-family': 1 },
    'font-[700]': { 'font-weight': 1 },
    'font-[family-name:var(--font-mono)]': {},
    'leading-[1.4]': { 'line-height': 1 },
    'tracking-[-0.02em]': { 'letter-spacing': 1 },
    'duration-[180ms]': { duration: 1 },
    'ease-[cubic-bezier(.22,1,.36,1)]': { easing: 1 },
    'animate-[spin_1s_linear_infinite]': { duration: 1, easing: 1 },
    'z-[60]': { 'z-index': 1 },
    '[padding:18px]': { spacing: 1 },
    '[font-weight:700]': { 'font-weight': 1 },
    '[font-family:Arial]': { 'font-family': 1 },
    '[color:red]': { color: 1 },
    '[--my-var:#fff]': { color: 1 },
    '[mask-type:luminance]': {},
    'w-[calc(100%-2px)]': {},
    'grid-cols-[1fr_2fr]': {},
    'size-[12px]': {},
  }
  for (const [cls, expected] of Object.entries(cases)) assert.deepEqual(classifyClass(cls), expected, cls)
})

// TypeScript and TSX

test('TypeScript: template expressions are code, not text', () => {
  assert.deepEqual(tsx(`
    const bar = { background: \`linear-gradient(90deg, \${MONOKAI.pink}, \${MONOKAI.orange}, #ffffff)\` }
    const label = \`\${MONOKAI.purple} and orange\`
  `), { color: 1 })
})

test('TypeScript: style entries follow the CSS rules for their property', () => {
  assert.deepEqual(tsx(`
    const a = <div style={{ fontSize: '48px', padding: 0, gap: 12, lineHeight: 0.9, marginTop: -4 }} />
    const b = <div style={{ gap: 'var(--spacing-2xl)', padding: 'var(--spacing-md, 16px)', color: 'rgba(252, 252, 250, 0.5)' }} />
    const c = <div style={{ zIndex: 1, fontFamily: 'monospace', borderRadius: '50%', fontWeight: 'bold', borderTopLeftRadius: 8 }} />
    const d = <div style={{ font: '500 16px/1.5 Arial', filter: 'drop-shadow(0 4px 8px var(--color-border-subtle))', backdropFilter: 'drop-shadow(0 1px 2px #000)' }} />
    const e = <div style={{ transitionDuration: '180ms', transitionTimingFunction: 'ease-out', transitionDelay: '40ms', transition: 'opacity 180ms ease-out' }} />
    const f = { ['padding']: '12px', [\`margin\`]: 8, padding: pad, gap: \`\${x}px\` }
  `), {
    'font-size': 1, spacing: 4, 'line-height': 1, fallback: 1, color: 2, 'font-family': 1, 'font-weight': 1, radius: 1,
    font: 4, shadow: 2, duration: 3, easing: 2,
  })
})

test('TypeScript: motion options, timers, and wrappers that do not change a literal', () => {
  assert.deepEqual(tsx(`
    el.animate(frames, { duration: 220, delay: 0, easing: 'cubic-bezier(.22, 1, .36, 1)' })
    el.animate(frames, 300)
    const reset = setTimeout(() => setState('idle'), 1800)
    const paren = setTimeout(callback, (1_800))
    const typed = { duration: 220 as const, delay: (40 as number)!, wait: 0 satisfies number }
    window.setInterval(tick, 0)
    const later = setTimeout(fn, delayMs)
  `), { duration: 6, easing: 1 })
})

test('TypeScript: style assignments, setProperty, class fields, and timing constants', () => {
  assert.deepEqual(tsx(`
    el.style.padding = '12px'
    el.style.setProperty('--gap', '12px')
    el.style.setProperty('color', theme.ink)
    class Panel { padding = '4px'; label = 'Panel' }
    const FADE_MS = 180
    const timeoutMs = (5_000)
    const retryDelay = 0
    const items = 3
    const rooms = 12
    const fadeDuration = 240
    const pause = setTimeout(fn, 60 * 1000)
    const later = setTimeout(fn, base * 2)
    const d = <div style={{ padding: 8 * 2, margin: -(4 + 4) }} />
  `), { spacing: 4, duration: 4 })
})

test('TypeScript: JSX color attributes count; other attributes and non style keys do not', () => {
  assert.deepEqual(tsx(`
    const icon = <path fill="#a9dc76" stroke="white" strokeWidth="2" d="M0 0h10" />
    const stop = <stop stopColor="#fff" offset="0.5" />
    const skip = <a href="#add" title="#bed">Skip</a>
    const link = { href: '#add', label: '#face', color: '#cafe' }
  `), { color: 4 })
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
    const toggled = clsx({ 'text-xs': active, 'rounded-lg': open }, [active ? 'text-lg' : 'text-xl'])
    const typed: 'text-5xl' = 'text-5xl'
  `), { 'tailwind-type': 6, 'tailwind-color': 3, 'tailwind-scale': 2, color: 1, fallback: 1 })
})

test('TypeScript: raw: covers its line, the next line when alone, and everything inside what it covers', () => {
  assert.deepEqual(tsx(`
    // raw: chart gutter matches the SVG viewBox
    const style = { padding: 18 }
    const gap = { gap: 10 } // raw: aligns with the axis label
    const margin = { margin: 6 }
    // raw: brand mark artwork, the whole statement
    const art = (
      <svg>
        <path fill="#a9dc76" />
        <g><circle fill="#ffd866" r="4" /></g>
      </svg>
    )
    const art2 = (
      <svg>
        {/* raw: this element and its children */}
        <g>
          <path
            fill="#1a2b3c"
          />
        </g>
        <path fill="#4d5e6f" />
      </svg>
    )
    // raw: left behind

    const orphan = { padding: 4 }
  `), { spacing: 2, color: 1 })
})

// MDX

test('MDX: JSX attributes count like TSX; prose, inline code, and fenced code are content', () => {
  assert.deepEqual(mdx([
    'Patch bumps change a value: `#4ea1ff` to `#3d9aff`, and `className="text-lg"` is how you set it.',
    '',
    '   ```json',
    '   { "padding": "12px", "color": "#0066cc" }',
    '   <div className="text-sm" />',
    '   ```',
    '',
    "<div className='text-white/60'>caption</div>",
    '',
    '<div className="rounded-md',
    '  text-sm" style={{ padding: 12 }}>note</div>',
    '',
    '<span className={`text-xs`}>new</span>',
    '',
    "<p className={active ? 'text-lg' : 'text-xl'} />",
    '',
    '<CodeBlock code={`<div className="text-white/60" />',
    '  more`} language="tsx" />',
    '',
    '<svg fill="#fff"><path d="M0 0" /></svg>',
  ]), { 'tailwind-color': 1, 'tailwind-scale': 1, 'tailwind-type': 4, spacing: 1, color: 1 })
})

test('MDX: spreads, expressions, and export blocks are JavaScript and count like TSX', () => {
  const hits = scanMdx([
    'export const panel = { padding: 12, label: "Panel" }',
    '',
    '<div {...{ style: { padding: 12 }, className: "text-sm" }} {...rest} />',
    '',
    '{cond && <p className="text-lg">x</p>}',
    '',
    'Text {value} and {"#fff"} here, but `{"#000"}` is code.',
    '',
    '{/* raw: brand artwork */}',
    '{<path fill="#123456" />}',
  ].join('\n'))
  assert.deepEqual(hits.map((h) => [h.category, h.line]), [['spacing', 1], ['spacing', 3], ['tailwind-type', 3], ['tailwind-type', 5], ['color', 7]])
})

test('MDX: frontmatter is content, and line numbers survive it', () => {
  const hits = scanMdx(['---', 'title: "Use {tokens} in a {brace}"', 'role: x', '---', '', '# Hi', '', '<p className="text-sm">x</p>'].join('\n'))
  assert.deepEqual(hits.map((h) => [h.category, h.line]), [['tailwind-type', 8]])
})

test('MDX: a raw: expression exempts the elements on its line or the next line, and their children', () => {
  const hits = scanMdx([
    '{/* raw: matches the screenshot frame */}',
    "<img className='rounded-lg' />",
    '',
    '<Figure>',
    '  {/* raw: brand artwork */}',
    '  <svg fill="#fff"><path fill="#000" /></svg>',
    '  <p className="text-sm">caption</p>',
    '</Figure>',
    '',
    '{/* raw: left behind */}',
    '',
    '<p className="text-xl">after a blank line</p>',
  ].join('\n'))
  assert.deepEqual(hits.map((h) => [h.category, h.line]), [['tailwind-type', 7], ['tailwind-type', 12]])
})

// The tree and the ratchet

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
    'src/content/post.mdx': '# Hi\n\n<Note className="text-sm" />\n',
    'src/lib/demo.ts': "export const sample = { color: '#33CCFF' }\n",
    'src/tokens/next/tokens.css': ':root { --color-base-black: color(srgb 0.03 0.03 0.03); }\n',
    'src/styles/generated/tokens.css': ':root { --token-color-canvas: 8 8 8; }\n',
    'src/components/Card.test.mjs': "const x = '#ffffff'\n",
  })
  assert.equal(run(root, '--reset').status, 0)
  assert.deepEqual((await baseline(root)).files, {
    'src/components/Card.module.css': { spacing: 1 },
    'src/content/post.mdx': { 'tailwind-type': 1 },
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
