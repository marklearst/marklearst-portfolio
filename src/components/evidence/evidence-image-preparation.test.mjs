import assert from 'node:assert/strict'
import test from 'node:test'
import { createEvidenceImagePreparation, stageSizes, viewerSizes } from './evidence-image-preparation.ts'

const item = {
  src: '/evidence/example.png', width: 1600, height: 1000,
  title: 'Token inspector', alt: 'Tokens grouped by collection', caption: 'An exported token collection.',
}
const settle = () => new Promise(resolve => setImmediate(resolve))
const currentRequest = () => ({ isCurrent: () => true, onPending: () => {} })

function createHarness() {
  let environment = { width: 1200, pixelRatio: 1 }
  const calls = []
  const prepare = createEvidenceImagePreparation({
    readEnvironment: () => environment,
    decode: (image, sizes) => {
      const deferred = Promise.withResolvers()
      calls.push({ image, sizes, environment: { ...environment }, ...deferred })
      return deferred.promise
    },
  })
  return { prepare, calls, setEnvironment: value => { environment = value } }
}

test('both responsive surfaces must decode; concurrent and ready requests reuse them', async () => {
  const { prepare, calls } = createHarness()
  let ready = false
  const first = prepare(item, currentRequest()).then(value => { ready = value; return value })
  const concurrent = prepare(item, currentRequest())
  await settle()
  assert.deepEqual(calls.map(call => call.sizes), [stageSizes, viewerSizes])

  calls[0].resolve()
  await settle()
  assert.equal(ready, false, 'a stage decode alone must not expose unprepared viewer content')
  calls[1].resolve()
  assert.deepEqual(await Promise.all([first, concurrent]), [true, true])

  const cached = await prepare(item, {
    isCurrent: () => true,
    onPending: () => assert.fail('ready images should not show loading feedback'),
  })
  assert.equal(cached, true)
  assert.equal(calls.length, 2)
})

for (const [change, environment] of [
  ['width', { width: 600, pixelRatio: 1 }],
  ['pixel density', { width: 1200, pixelRatio: 2 }],
]) {
  for (const outcome of ['success', 'failure']) {
    test(`a ${change} change during ${outcome} prepares the new responsive candidates`, async () => {
      const { prepare, calls, setEnvironment } = createHarness()
      let ready = false
      const result = prepare(item, currentRequest()).then(value => { ready = value; return value })
      await settle()
      setEnvironment(environment)
      if (outcome === 'failure') calls[0].reject(new Error('obsolete candidate failed'))
      else calls[0].resolve()
      calls[1].resolve()
      await settle()

      assert.equal(ready, false)
      assert.equal(calls.length, 4)
      assert.deepEqual(calls.slice(2).map(call => call.environment), [environment, environment])
      calls[2].resolve()
      calls[3].resolve()
      assert.equal(await result, true)
    })
  }
}

test('invalidated requests cannot report readiness or a stale failure', async () => {
  for (const outcome of ['success', 'failure']) {
    const { prepare, calls } = createHarness()
    let current = true
    const result = prepare(item, { isCurrent: () => current, onPending: () => {} })
    await settle()
    current = false
    if (outcome === 'failure') calls[0].reject(new Error('stale image failed'))
    else calls[0].resolve()
    calls[1].resolve()
    assert.equal(await result, false)
  }
})

test('a cancelled request starts no decode or loading feedback', async () => {
  const { prepare, calls } = createHarness()
  assert.equal(await prepare(item, {
    isCurrent: () => false,
    onPending: () => assert.fail('cancelled requests must not update feedback'),
  }), false)
  assert.equal(calls.length, 0)
})

test('a failed decode can be retried with fresh candidates', async () => {
  const { prepare, calls } = createHarness()
  const failure = new Error('image unavailable')
  const first = prepare(item, currentRequest())
  const rejected = assert.rejects(first, failure)
  await settle()
  calls[0].reject(failure)
  calls[1].resolve()
  await rejected

  const retry = prepare(item, currentRequest())
  await settle()
  assert.equal(calls.length, 4)
  calls[2].resolve()
  calls[3].resolve()
  assert.equal(await retry, true)
})

test('a synchronous decoder error uses the same recoverable failure path', async () => {
  const failure = new Error('invalid image source')
  let failing = true
  const prepare = createEvidenceImagePreparation({
    readEnvironment: () => ({ width: 1200, pixelRatio: 1 }),
    decode: () => {
      if (failing) throw failure
      return Promise.resolve()
    },
  })
  await assert.rejects(prepare(item, currentRequest()), failure)
  failing = false
  assert.equal(await prepare(item, currentRequest()), true)
})

test('an older rejection cannot evict a replacement started during cancellation', async () => {
  const { prepare, calls } = createHarness()
  let cancelled = false
  let replacement
  const oldFirst = prepare(item, {
    isCurrent: () => {
      if (!cancelled) return true
      replacement ??= prepare(item, currentRequest())
      return false
    },
    onPending: () => {},
  })
  const oldSecond = prepare(item, { isCurrent: () => !cancelled, onPending: () => {} })
  await settle()
  cancelled = true
  calls[0].reject(new Error('old candidate failed'))
  calls[1].resolve()
  assert.deepEqual(await Promise.all([oldFirst, oldSecond]), [false, false])

  const joinedReplacement = prepare(item, currentRequest())
  await settle()
  assert.equal(calls.length, 4, 'the newer candidate must remain cached for concurrent requests')
  calls[2].resolve()
  calls[3].resolve()
  assert.deepEqual(await Promise.all([replacement, joinedReplacement]), [true, true])
})
