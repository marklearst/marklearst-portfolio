import test from 'node:test'
import assert from 'node:assert/strict'
import { curveProgress, curvePath } from './motion-curve.ts'

test('linear easing maps time to progress even with nonuniform control points', () => {
  for (const time of [0, .01, .1, .25, .5, .75, .99, 1]) {
    assert.ok(Math.abs(curveProgress(time, [.1, .1, .8, .8]) - time) < 1e-7)
  }
})

test('the site enter curve is ahead of linear time and stays bounded', () => {
  const curve = [.22, 1, .36, 1]
  assert.equal(curveProgress(0, curve), 0)
  assert.equal(curveProgress(1, curve), 1)
  assert.ok(curveProgress(.5, curve) > .9)
  let previous = 0
  for (let i = 1; i <= 100; i++) {
    const progress = curveProgress(i / 100, curve)
    assert.ok(progress >= previous && progress <= 1)
    previous = progress
  }
})

test('degenerate time handles still resolve and the plot inverts only its y axis', () => {
  assert.ok(Math.abs(curveProgress(.125, [0, 0, 0, 1]) - .5) < 1e-7)
  assert.equal(curvePath([.22, 1, .36, 1]), 'M0 100 C22 0 36 0 100 0')
  assert.equal(curveProgress(-1, [0, 0, 1, 1]), 0)
  assert.equal(curveProgress(2, [0, 0, 1, 1]), 1)
})
