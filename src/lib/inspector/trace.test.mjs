import assert from 'node:assert/strict'
import test from 'node:test'
import { traceTokens } from './trace.ts'

const BASE = 'color.brand.dark'
const LIGHT = 'color.brand.light'
const ACCENT = 'semantic.accent'
const BORDER = 'semantic.border'
const BUTTON = 'component.button.fill'
const LINK = 'component.link.ink'
const CARD = 'component.card.border'
const DARK = { theme: 'dark' }
const color = (text, literal = false) => ({ kind: 'color', text, css: text, literal })
const variable = (path) => `--${path.replaceAll('.', '-')}`
const edge = (from, to, broken = false) => ({ from, to, broken })
const paths = (trace) => trace.nodes.map((node) => node.path).sort()

// Source facts: two meanings share a base; two components share one meaning.
// A button's label is independent of its fill, despite sharing a component name.
function fixture({ held, base = '#DB1834' } = {}) {
  const findings = held === undefined ? [] : [{
    ruleId: 'PT1003', path: ACCENT, layerId: 'meaning', message: 'Meaning tokens require references.',
  }]
  const facts = {
    [BASE]: { value: color(base) },
    [LIGHT]: { value: color('#A01028') },
    'color.ink': { value: color('#F4F4F2') },
    [ACCENT]: held === undefined ? { references: { dark: BASE, light: LIGHT } } : { value: color(held, true) },
    [BORDER]: { reference: BASE },
    [BUTTON]: { reference: ACCENT },
    [LINK]: { reference: ACCENT },
    [CARD]: { reference: BORDER },
    'component.button.label': { reference: 'color.ink' },
  }
  function chain(path, selection) {
    if (!facts[path]) return null
    const steps = []
    for (let current = path; current;) {
      const source = facts[current]
      steps.push({
        path: current,
        layer: current.startsWith('semantic.') ? 'meaning' : current.split('.')[0] === 'component' ? 'component' : 'base',
        context: source.references ? selection.theme : null,
        finding: findings.find((finding) => finding.path === current) ?? null,
      })
      if (source.value) return { steps, value: source.value }
      current = source.references?.[selection.theme] ?? source.reference
    }
  }
  return {
    broken: held !== undefined,
    chain,
    resolve: (path, selection) => chain(path, selection)?.value.css,
    dependents: (path, selection) => Object.keys(facts)
      .map((candidate) => ({ path: candidate, hops: chain(candidate, selection).steps.findIndex((step) => step.path === path) }))
      .filter(({ hops }) => hops >= 0).sort((a, b) => a.hops - b.hops),
    check: () => ({ command: 'primitree check', tokens: Object.keys(facts).length, layers: 3, contexts: 2, findings, exit: findings.length ? 1 : 0 }),
  }
}

test('a base trace includes both branches and their transitive dependents', () => {
  const graph = fixture()
  const trace = traceTokens(graph, graph, BASE, DARK, variable)
  assert.equal(trace.focus, BASE)
  assert.equal(trace.dependents, 5)
  assert.deepEqual(paths(trace), [BASE, ACCENT, BORDER, BUTTON, LINK, CARD].sort())
  assert.deepEqual(new Set(trace.edges), new Set([
    edge(BASE, ACCENT), edge(BASE, BORDER), edge(ACCENT, BUTTON), edge(ACCENT, LINK), edge(BORDER, CARD),
  ]))
})

test('a meaning trace includes its ancestors and dependents without expanding ancestor siblings', () => {
  const graph = fixture()
  const trace = traceTokens(graph, graph, ACCENT, DARK, variable)
  assert.equal(trace.dependents, 2)
  assert.deepEqual(paths(trace), [ACCENT, BASE, BUTTON, LINK].sort())
  assert.deepEqual(new Set(trace.edges), new Set([edge(BASE, ACCENT), edge(ACCENT, BUTTON), edge(ACCENT, LINK)]))
  for (const node of trace.nodes) {
    assert.deepEqual(node.value, color('#DB1834'))
    assert.equal(node.variable, variable(node.path))
    assert.equal(node.finding, null)
  }
  assert.deepEqual(new Set(trace.nodes.map((node) => node.layer)), new Set(['base', 'meaning', 'component']))
})

test('selecting a component isolates its chain from sibling consumers and other component properties', () => {
  const graph = fixture()
  const trace = traceTokens(graph, graph, BUTTON, DARK, () => null)
  assert.equal(trace.dependents, 0)
  assert.deepEqual(paths(trace), [BUTTON, ACCENT, BASE].sort())
  assert.deepEqual(new Set(trace.edges), new Set([edge(BASE, ACCENT), edge(ACCENT, BUTTON)]))
  assert.ok(trace.nodes.every((node) => node.variable === null))
})

test('PT1003 retains the former reference, held literal, and current value of the built source', () => {
  const built = fixture()
  const graph = fixture({ held: '#DB1834', base: '#008877' })
  const trace = traceTokens(graph, built, BUTTON, DARK, variable)
  assert.deepEqual(paths(trace), [BUTTON, ACCENT, BASE].sort())
  assert.deepEqual(new Set(trace.edges), new Set([edge(BASE, ACCENT, true), edge(ACCENT, BUTTON)]))
  const nodes = new Map(trace.nodes.map((node) => [node.path, node]))
  assert.deepEqual(nodes.get(ACCENT).finding, graph.check().findings[0])
  assert.deepEqual(nodes.get(ACCENT).value, color('#DB1834', true))
  assert.deepEqual(nodes.get(BUTTON).value, color('#DB1834', true))
  assert.deepEqual(nodes.get(BASE).value, color('#008877'))
  assert.equal(nodes.get(BASE).finding, null)
  assert.equal(trace.dependents, 0)
})

test('active and former parents follow the selected context', () => {
  const built = fixture()
  for (const [theme, parent, text] of [['dark', BASE, '#DB1834'], ['light', LIGHT, '#A01028']]) {
    for (const held of [undefined, '#123456']) {
      const trace = traceTokens(fixture({ held }), built, BUTTON, { theme }, variable)
      assert.deepEqual(paths(trace), [BUTTON, ACCENT, parent].sort())
      assert.deepEqual(new Set(trace.edges), new Set([edge(parent, ACCENT, held !== undefined), edge(ACCENT, BUTTON)]))
      assert.deepEqual(trace.nodes.find((node) => node.path === parent).value, color(text))
      assert.deepEqual(trace.nodes.find((node) => node.path === BUTTON).value, color(held ?? text, held !== undefined))
    }
  }
})

test('an unknown focus fails explicitly', () => {
  const graph = fixture()
  assert.throws(() => traceTokens(graph, graph, 'missing.token', DARK, variable), /Cannot trace unknown token missing\.token\./)
})
