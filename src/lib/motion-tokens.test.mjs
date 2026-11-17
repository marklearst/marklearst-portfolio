import assert from 'node:assert/strict'
import test from 'node:test'
import { durationMs, motionEase } from './motion-tokens.ts'

const values = new Map()
globalThis.document = { documentElement: {} }
globalThis.getComputedStyle = () => ({ getPropertyValue: (name) => values.get(name) ?? '' })

test('CSS duration units convert without losing reduced or slow motion', () => {
  for (const [css, expected] of [['180ms', 180], ['0.72s', 720], ['0ms', 0]]) {
    values.set('--semantic-duration-reveal', css)
    assert.equal(durationMs('--semantic-duration-reveal') / 1000, expected / 1000)
  }
})

test('Motion receives the token’s four Bezier control points', () => {
  values.set('--semantic-easing-enter', 'cubic-bezier(0.22, 1, 0.36, 1)')
  assert.deepEqual(motionEase(), [0.22, 1, 0.36, 1])
  values.set('--semantic-easing-move', 'cubic-bezier(0.645, 0.045, 0.355, 1)')
  assert.deepEqual(motionEase('--semantic-easing-move'), [0.645, 0.045, 0.355, 1])
})

test('an absent or malformed curve cannot silently become Motion’s default easing', () => {
  for (const css of ['', 'ease-out', 'cubic-bezier(0.2, nope, 1, 1)', 'cubic-bezier(0.2, 1)']) {
    values.set('--semantic-easing-enter', css)
    assert.throws(() => motionEase(), /must resolve to a cubic Bezier/)
  }
})
