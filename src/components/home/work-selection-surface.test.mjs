import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const { outputText } = ts.transpileModule(readFileSync(new URL('./work-selection-surface.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})

function setup(t) {
  const observers = []
  const animations = []
  let geometryReads = 0
  function element(top = 0, height = 100) {
    const listeners = new Map()
    return {
      dataset: {}, listeners,
      style: {
        transform: '', clipPath: '',
        removeProperty(name) { this[name === 'clip-path' ? 'clipPath' : name] = '' },
      },
      addEventListener(type, callback) { listeners.set(type, callback) },
      removeEventListener(type, callback) {
        if (listeners.get(type) === callback) listeners.delete(type)
      },
      getBoundingClientRect() {
        geometryReads++
        return { left: 0, top, bottom: top + height, height }
      },
      animate() {
        let finish, reject
        const animation = {
          cancelled: false,
          finished: new Promise((resolve, onReject) => { finish = resolve; reject = onReject }),
          finish() { finish() },
          cancel() { this.cancelled = true; reject(new Error('cancelled')) },
        }
        animations.push(animation)
        return animation
      },
    }
  }
  class Observer {
    connected = false
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe() { this.connected = true }
    disconnect() { this.connected = false }
  }
  const tabs = [element(), element(100)]
  const list = element(0, 200)
  list.querySelectorAll = () => tabs
  const surface = element()
  const window = { ...element(), innerHeight: 1000 }
  const exports = {}
  runInNewContext(outputText, {
    exports, window,
    document: { documentElement: { hasAttribute: () => false } },
    ResizeObserver: Observer, MutationObserver: Observer,
    getComputedStyle: el => ({ ...el.style, borderRadius: '12px' }),
    require(name) {
      assert.equal(name, '@/lib/motion-tokens')
      return { durationMs: () => 280, easing: () => 'linear' }
    },
  })
  const api = exports.attachWorkSelectionSurface(list, surface)
  t.after(() => api.destroy())
  api.moveTo(tabs[0], false)
  return { api, list, surface, window, tabs, animations, observers, reads: () => geometryReads }
}

test('a queued animation completion cannot restore a destroyed surface', async t => {
  const h = setup(t)
  h.api.moveTo(h.tabs[1], true)
  h.animations[0].finish()
  h.api.destroy()
  const reads = h.reads()
  await Promise.resolve()
  assert.equal(h.reads(), reads, 'Queued completion must not measure the disposed elements')
  assert.equal(h.surface.style.transform, '')
  assert.equal(h.surface.style.clipPath, '')
  assert.equal(Object.hasOwn(h.list.dataset, 'selectionReady'), false)
  assert.equal(h.window.listeners.size + h.list.listeners.size, 0)
  assert.ok(h.observers.every(observer => !observer.connected))
})

test('keyboard cancels active travel without measuring an idle selector', async t => {
  const h = setup(t)
  const reads = h.reads()
  h.window.listeners.get('keydown')()
  assert.equal(h.reads(), reads)
  h.api.moveTo(h.tabs[1], true)
  h.window.listeners.get('keydown')()
  assert.equal(h.animations[0].cancelled, true)
  assert.equal(h.animations.length, 1)
  assert.equal(h.surface.style.transform, 'translate(0px, 100px)')
  const settledReads = h.reads()
  h.window.listeners.get('keydown')()
  await Promise.resolve()
  assert.equal(h.reads(), settledReads)
})
