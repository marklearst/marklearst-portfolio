import assert from 'node:assert/strict'
import test from 'node:test'
import { tracePropagation } from './trace-propagation.ts'

function fixture(color, broken = false) {
  const held = broken ? '#DB1834' : color
  return {
    focus: 'semantic.accent', dependents: 2,
    nodes: [
      ['base.accent', 'base', color],
      ['semantic.accent', 'meaning', held],
      ['button.background', 'component', held],
      ['link.text', 'component', held],
      ['base.ink', 'base', '#FFFFFF'],
      ['button.text', 'component', '#FFFFFF'],
    ].map(([path, layer, css]) => ({ path, layer, value: { kind: 'color', css }, finding: null })),
    edges: [
      { from: 'base.accent', to: 'semantic.accent', broken },
      { from: 'semantic.accent', to: 'button.background', broken: false },
      { from: 'semantic.accent', to: 'link.text', broken: false },
      { from: 'base.ink', to: 'button.text', broken: false },
    ],
  }
}

test('a changed source reaches both dependent branches, leaving independent ink still', () => {
  const result = tracePropagation(fixture('#DB1834'), fixture('#008877'))
  assert.deepEqual([...result.depths], [['base.accent', 0], ['semantic.accent', 1], ['button.background', 2], ['link.text', 2]])
  assert.deepEqual(result.edges.map(edge => edge.to), ['semantic.accent', 'button.background', 'link.text'])
})

test('a severed reference stops the signal even if disconnected values change independently', () => {
  const before = fixture('#DB1834', true)
  const after = fixture('#008877', true)
  for (const node of after.nodes.filter(node => node.layer !== 'base')) node.value.css = '#FFAA00'
  const result = tracePropagation(before, after)
  assert.deepEqual([...result.depths], [['base.accent', 0]])
  assert.deepEqual(result.edges, [])
})

test('an unchanged trace and newly revealed nodes do not invent a value change', () => {
  assert.equal(tracePropagation(fixture('#DB1834'), fixture('#DB1834')).depths.size, 0)
  const before = fixture('#DB1834')
  before.nodes = before.nodes.filter(node => node.layer !== 'base')
  assert.equal(tracePropagation(before, fixture('#008877')).depths.size, 0)
})

test('a finding on a changed meaning prevents the signal from reaching consumers', () => {
  const after = fixture('#008877')
  after.nodes.find(node => node.path === 'semantic.accent').finding = { ruleId: 'PT1003' }
  const result = tracePropagation(fixture('#DB1834'), after)
  assert.deepEqual([...result.depths], [['base.accent', 0]])
  assert.deepEqual(result.edges, [])
})
