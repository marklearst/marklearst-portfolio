import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { swipeDestination } from './work-swipe-intent.ts'

// Load the actual implementation without rewriting its imports or gesture logic.
// Only its DOM, motion token, and animation boundaries receive doubles.
const { outputText } = ts.transpileModule(readFileSync(new URL('./work-swipe.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})

class EventSurface {
  listeners = new Map()

  addEventListener(type, callback, options) {
    const capture = options === true || options?.capture === true
    const listeners = this.listeners.get(type) ?? []
    listeners.push({ callback, capture })
    this.listeners.set(type, listeners)
  }

  removeEventListener(type, callback, options) {
    const capture = options === true || options?.capture === true
    this.listeners.set(type, (this.listeners.get(type) ?? []).filter(entry => entry.callback !== callback || entry.capture !== capture))
  }

  // Deliver at the registered boundary. A supplied descendant target represents
  // a bubbled event; browser propagation and layout remain the UI check's job.
  emit(type, init = {}) {
    const event = {
      target: this, pointerId: 1, isPrimary: true, button: 0,
      clientX: 300, clientY: 100, timeStamp: 0, detail: 1,
      ctrlKey: false, metaKey: false, altKey: false, shiftKey: false,
      ...init,
      defaultPrevented: false, propagationStopped: false,
      preventDefault() { this.defaultPrevented = true },
      stopPropagation() { this.propagationStopped = true },
    }
    for (const { callback } of [...(this.listeners.get(type) ?? [])]) callback(event)
    return event
  }

  get listenerCount() {
    return [...this.listeners.values()].reduce((count, listeners) => count + listeners.length, 0)
  }
}

class Style {
  properties = new Map()
  getPropertyValue(name) { return this.properties.get(name)?.value ?? '' }
  getPropertyPriority(name) { return this.properties.get(name)?.priority ?? '' }
  setProperty(name, value, priority = '') { this.properties.set(name, { value, priority }) }
  removeProperty(name) { this.properties.delete(name) }
  get transform() { return this.getPropertyValue('transform') }
  set transform(value) { this.setProperty('transform', value) }
}

class Element extends EventSurface {
  dataset = {}
  style = new Style()
  captures = new Set()

  constructor(parent = null) {
    super()
    this.parent = parent
    this.animations = parent?.animations ?? []
  }

  hasAttribute(name) {
    assert.ok(name.startsWith('data-'))
    const key = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    return Object.hasOwn(this.dataset, key)
  }

  closest(selector) {
    assert.equal(selector, '[data-work-preview]')
    if (this.hasAttribute('data-work-preview')) return this
    return this.parent?.closest(selector) ?? null
  }

  getBoundingClientRect() { return { width: 600 } }
  hasPointerCapture(pointer) { return this.captures.has(pointer) }
  setPointerCapture(pointer) { this.captures.add(pointer) }
  releasePointerCapture(pointer) { this.captures.delete(pointer) }

  animate(keyframes, options) {
    assert.equal(keyframes.transform.length, 2)
    assert.equal(options.duration, 260, 'Native animation timing stays in milliseconds')
    assert.equal(options.easing, 'cubic-bezier(0, 0, 1, 1)')
    assert.equal(options.fill, 'both')
    let finish, reject
    const animation = {
      cancelled: false,
      finished: new Promise((resolve, onReject) => { finish = resolve; reject = onReject }),
      cancel() {
        this.cancelled = true
        reject(Object.assign(new Error('Animation cancelled'), { name: 'AbortError' }))
      },
      finish() { finish() },
    }
    this.animations.push(animation)
    return animation
  }
}

function setup(t) {
  const stage = new Element()
  const window = new EventSurface()
  const document = { documentElement: new Element() }
  const panels = ['primitree', 'skydio', 'a11y-companion'].map((id, index) => {
    const panel = new Element(stage)
    panel.dataset = { workProject: id, active: String(index === 0) }
    return panel
  })
  stage.querySelectorAll = selector => {
    assert.equal(selector, '[data-work-project]')
    return panels
  }
  const preview = new Element(panels[0])
  preview.dataset.workPreview = ''
  const image = new Element(preview)
  const textLink = new Element(panels[0])
  const animations = stage.animations
  const observers = []
  const selected = []
  class MutationObserver {
    connected = false
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe() { this.connected = true }
    disconnect() { this.connected = false }
  }
  const dependencies = {
    '@/lib/motion-tokens': {
      durationMs: () => 260,
      easing: () => 'cubic-bezier(0, 0, 1, 1)',
    },
    './work-swipe-intent': { swipeDestination },
  }
  const exports = {}
  runInNewContext(outputText, {
    exports, Element, document, window, MutationObserver,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`)
      return dependencies[name]
    },
  }, { filename: 'work-swipe.ts' })
  const api = exports.attachWorkSwipe(stage, id => {
    selected.push(id)
    for (const panel of panels) panel.dataset.active = String(panel.dataset.workProject === id)
  })
  t.after(() => api.destroy())

  function startDrag() {
    stage.emit('pointerdown', { target: image })
    window.emit('pointermove', { target: image, clientX: 100, timeStamp: 40 })
    assert.equal(stage.hasPointerCapture(1), true)
    assert.equal(stage.hasAttribute('data-swiping'), true)
  }

  function assertClean() {
    assert.equal(stage.hasPointerCapture(1), false)
    assert.equal(stage.hasAttribute('data-swiping'), false)
    for (const panel of panels) assert.equal(panel.hasAttribute('data-swipe-visible'), false)
  }

  return { stage, window, panels, preview, image, textLink, animations, observers, selected, api, startDrag, assertClean }
}

test('a tap keeps normal preview link activation', t => {
  const h = setup(t)
  h.stage.emit('pointerdown', { target: h.image })
  h.window.emit('pointerup', { target: h.image, timeStamp: 20 })
  const click = h.stage.emit('click', { target: h.image })
  assert.equal(click.defaultPrevented, false)
  assert.equal(click.propagationStopped, false)
  assert.deepEqual(h.selected, [])
  h.assertClean()
})

test('a vertical drag allows scrolling but suppresses its release click', t => {
  const h = setup(t)
  h.stage.emit('pointerdown', { target: h.image })
  const move = h.window.emit('pointermove', { target: h.image, clientX: 303, clientY: 160, timeStamp: 40 })
  assert.equal(move.defaultPrevented, false)
  // Horizontal movement after the vertical rejection must not start a swipe.
  h.window.emit('pointermove', { clientX: 100, clientY: 160, timeStamp: 60 })
  h.window.emit('pointerup', { timeStamp: 80 })
  const click = h.stage.emit('click', { target: h.image })
  assert.equal(click.defaultPrevented, true)
  assert.equal(click.propagationStopped, true)
  assert.deepEqual(h.selected, [])
  assert.equal(h.animations.length, 0)
  h.assertClean()
})

for (const modifier of [null, 'ctrlKey', 'metaKey', 'altKey', 'shiftKey']) {
  test(`a cancelled drag preserves the next ${modifier ?? 'text link'} click`, t => {
    const h = setup(t)
    h.startDrag()
    h.window.emit('pointercancel', { timeStamp: 50 })
    h.assertClean()
    // A cancellation has no release click to consume the pending suppression.
    const input = { target: modifier ? h.image : h.textLink, ...(modifier ? { [modifier]: true } : {}) }
    h.stage.emit('pointerdown', { ...input, timeStamp: 100 })
    h.window.emit('pointerup', { ...input, timeStamp: 120 })
    const click = h.stage.emit('click', input)
    assert.equal(click.defaultPrevented, false)
    assert.equal(click.propagationStopped, false)
    assert.deepEqual(h.selected, [])
    assert.equal(h.animations.length, 0)
    h.assertClean()
  })
}

test('descendant capture loss preserves the active drag and its selection', async t => {
  const h = setup(t)
  h.startDrag()
  h.stage.emit('lostpointercapture', { target: h.preview, timeStamp: 45 })
  assert.equal(h.stage.hasPointerCapture(1), true)
  assert.equal(h.stage.hasAttribute('data-swiping'), true)
  h.window.emit('pointerup', { timeStamp: 50 })
  assert.deepEqual(h.selected, ['skydio'])
  assert.ok(h.animations.length > 0)
  const click = h.stage.emit('click')
  assert.equal(click.defaultPrevented, true)
  for (const animation of h.animations) animation.finish()
  // Wait for the implementation's Promise.all completion and cleanup callback.
  await new Promise(resolve => setImmediate(resolve))
  h.assertClean()
  for (const panel of h.panels) assert.equal(panel.style.transform, '')
})

for (const cancellation of ['pointercancel', 'lostpointercapture']) {
  test(`${cancellation} on the active pointer restores styles and ends the gesture`, t => {
    const h = setup(t)
    h.panels[0].style.setProperty('transform', 'scale(0.9)', 'important')
    h.panels[2].style.setProperty('transform', 'rotate(1deg)')
    h.startDrag()
    assert.notEqual(h.panels[0].style.transform, 'scale(0.9)')
    assert.notEqual(h.panels[1].style.transform, '')
    const receiver = cancellation === 'pointercancel' ? h.window : h.stage
    receiver.emit(cancellation, { target: h.stage, timeStamp: 45 })
    h.assertClean()
    assert.equal(h.panels[0].style.transform, 'scale(0.9)')
    assert.equal(h.panels[0].style.getPropertyPriority('transform'), 'important')
    assert.equal(h.panels[1].style.transform, '')
    assert.equal(h.panels[2].style.transform, 'rotate(1deg)')
    h.window.emit('pointermove', { clientX: 0, timeStamp: 50 })
    h.window.emit('pointerup', { timeStamp: 60 })
    assert.deepEqual(h.selected, [])
    assert.equal(h.animations.length, 0)
  })
}

test('cancellation from another pointer does not end the active gesture', t => {
  const h = setup(t)
  h.startDrag()
  h.window.emit('pointercancel', { pointerId: 2 })
  h.stage.emit('lostpointercapture', { pointerId: 2 })
  assert.equal(h.stage.hasPointerCapture(1), true)
  h.window.emit('pointerup', { timeStamp: 50 })
  assert.deepEqual(h.selected, ['skydio'])
})

test('explicit cancellation stops settling animations and clears transient styles', t => {
  const h = setup(t)
  h.startDrag()
  h.window.emit('pointerup', { timeStamp: 50 })
  assert.ok(h.animations.length > 0)
  h.api.cancel()
  assert.ok(h.animations.every(animation => animation.cancelled))
  for (const panel of h.panels) assert.equal(panel.style.transform, '')
  h.assertClean()
})

test('destroy releases capture, restores styles, and removes its subscriptions', t => {
  const h = setup(t)
  h.startDrag()
  assert.ok(h.stage.listenerCount > 0)
  assert.ok(h.window.listenerCount > 0)
  assert.ok(h.observers.some(observer => observer.connected))
  h.api.destroy()
  h.assertClean()
  for (const panel of h.panels) assert.equal(panel.style.transform, '')
  assert.equal(h.stage.listenerCount, 0)
  assert.equal(h.window.listenerCount, 0)
  assert.ok(h.observers.every(observer => !observer.connected))
  h.window.emit('pointerup', { timeStamp: 50 })
  assert.deepEqual(h.selected, [])
})
