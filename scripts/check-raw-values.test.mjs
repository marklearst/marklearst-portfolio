import assert from 'node:assert/strict'
import test from 'node:test'
import { scanCss, scanTsx } from './check-raw-values.mjs'

const categories = (hits) => hits.map((hit) => hit.category)

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
  assert.deepEqual(categories(hits), ['spacing', 'color', 'radius', 'line-height', 'duration', 'easing', 'z-index'])
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

test('a raw: comment exempts the declaration that follows or shares its line', () => {
  const hits = scanCss(`
    .chart {
      /* raw: chart gutter matches the SVG viewBox */
      padding: 18px;
      margin-top: 3px; /* raw: optical alignment with the axis label */
      gap: 10px;
    }
  `)
  assert.deepEqual(categories(hits), ['spacing'])
  assert.equal(hits[0].text, 'gap: 10px')
})

test('breakpoints and hand written custom properties count', () => {
  const hits = scanCss(`
    :root { --ease-out: cubic-bezier(.22, 1, .36, 1); --duration-feedback: 140ms; --demo-ink: #ffffff; --gutter: 24px; }
    @media (min-width: 640px) { .a { display: grid; } }
  `)
  assert.deepEqual(categories(hits), ['easing', 'duration', 'color', 'breakpoint'])
})

test('TSX colors, Tailwind default scales, and inline styles count', () => {
  const hits = scanTsx(`
    const zone = { color: '#a9dc76' }
    <p className='text-white/50 text-sm duration-300 rounded-md text-[11px] px-4 rounded-full'>Hi</p>
    <div style={{ fontSize: '48px', padding: 0, gap: 12 }} />
    const timing = { duration: 220, easing: 'cubic-bezier(.22, 1, .36, 1)' }
    <path stroke='#78dce8' /> // raw: brand mark artwork
  `)
  assert.deepEqual(categories(hits), [
    'color',
    'tailwind-color', 'tailwind-type', 'tailwind-scale', 'tailwind-scale', 'tailwind-arbitrary',
    'inline-style', 'inline-style',
    'duration', 'easing',
  ])
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
