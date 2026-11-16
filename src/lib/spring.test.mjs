import assert from 'node:assert/strict'
import test from 'node:test'

// A clock the test turns by hand.
let queued = null
let now = 0
globalThis.requestAnimationFrame = (callback) => { queued = callback; return 1 }
globalThis.cancelAnimationFrame = () => { queued = null }
globalThis.performance = { now: () => now }

const { createSpring } = await import('./spring.ts')

/** Runs frames at 60 per second until the spring stops asking for them, and returns every value it wrote. */
function run(limit = 600) {
  for (let frames = 0; queued && frames < limit; frames += 1) {
    const callback = queued
    queued = null
    now += 1000 / 60
    callback(now)
  }
}

test('a spring arrives at its target and stops', () => {
  const seen = []
  const spring = createSpring((values) => seen.push([...values]), () => 180, 0)
  spring.set([0, 0])
  spring.to([100, -40])
  run()
  assert.equal(queued, null, 'it stopped asking for frames')
  assert.deepEqual(seen.at(-1), [100, -40])
  assert.ok(seen.every((values) => values.every(Number.isFinite)))
})

test('with no bounce it never passes its target, and with bounce it does', () => {
  const peak = (bounce) => {
    const seen = []
    const spring = createSpring(([value]) => seen.push(value), () => 180, bounce)
    spring.set([0])
    spring.to([100])
    run()
    return Math.max(...seen)
  }
  assert.ok(peak(0) <= 100.01, `no bounce peaked at ${peak(0)}`)
  assert.ok(peak(0.3) > 101, `bounce 0.3 peaked at ${peak(0.3)}`)
})

test('sent somewhere new mid flight, it keeps the speed it had', () => {
  const frame = () => { const callback = queued; queued = null; now += 1000 / 60; callback(now) }

  // One spring is caught on its way up and sent down.
  const moving = []
  const carried = createSpring(([value]) => moving.push(value), () => 180, 0)
  carried.set([0])
  carried.to([100])
  for (let i = 0; i < 4; i += 1) frame()
  const from = moving.at(-1)
  carried.to([-100])
  frame()
  const withMomentum = moving.at(-1) - from
  carried.stop()

  // Another starts the same trip from the same place, at rest, the way a restarted transition would.
  const still = []
  const restarted = createSpring(([value]) => still.push(value), () => 180, 0)
  restarted.set([from])
  restarted.to([-100])
  frame()
  const fromRest = still.at(-1) - from
  restarted.stop()

  // The first one is still being carried upward by the speed it had, so it has fallen less far.
  assert.ok(withMomentum > fromRest + 5, `carried ${withMomentum.toFixed(2)}, from rest ${fromRest.toFixed(2)}`)
})

test('with a duration of zero, which is what the reduced motion context gives it, it arrives at once', () => {
  const seen = []
  const spring = createSpring(([value]) => seen.push(value), () => 0, 0.3)
  spring.set([0])
  spring.to([100])
  run()
  assert.deepEqual(seen, [0, 100])
})
