import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { InspectorController } from './inspector-controller.ts'

const config = {
  themeColors: { dark: '#111111', light: '#ffffff' },
  check: { command: 'primitree check', tokens: 142, layers: 3, contexts: 6, findings: [], exit: 0 },
  reveal: { default: '180ms', reduced: '0ms', slow: '720ms' },
  brand: { built: { hue: 23, hex: '#DB1834' }, max: 359 },
}
const flush = () => new Promise((resolve) => setImmediate(resolve))
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

class Node extends EventTarget {
  dataset = {}
  isConnected = true
  textContent = ''
  matchesSelectors = new Set()
  closest(selector) { return this.matchesSelectors.has(selector) ? this : null }
  matches(selector) { return this.matchesSelectors.has(selector) }
  getBoundingClientRect() { return { width: 44, top: 0, bottom: 44 } }
  focus() { document.activeElement = this }
}

let calls, instances, surfaces, storage, reduced, light
beforeEach(() => {
  calls = []
  instances = []
  storage = new Map()
  reduced = Object.assign(new EventTarget(), { matches: false })
  light = Object.assign(new EventTarget(), { matches: false })
  globalThis.Element = Node
  globalThis.HTMLElement = Node
  globalThis.document = Object.assign(new EventTarget(), {
    documentElement: new Node(), activeElement: new Node(), getAnimations: () => [], querySelector: () => null, querySelectorAll: () => [],
  })
  globalThis.window = Object.assign(new EventTarget(), { matchMedia: (query) => query.includes('color-scheme') ? light : reduced, innerHeight: 844 })
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  }
  globalThis.requestAnimationFrame = (work) => { queueMicrotask(work); return 1 }
  surfaces = { overlay: new Node(), live: new Node() }
})

// The real runtime is browser tested. This boundary double records only commands
// crossing the download, so these tests exercise cancellation and ownership races.
class Runtime {
  constructor(_config, store) { this.store = store; instances.push(this) }
  attach(value) { calls.push(['attach', value]) }
  destroy() { calls.push(['destroy']) }
  registerSlot(value) { calls.push(['slot', value]) }
  routeChanged(value) { calls.push(['route', value]) }
  warm() { calls.push(['warm']) }
  themeChanged() { calls.push(['theme', this.store.getState().theme]) }
  resumeInspecting(on, options) {
    calls.push(['inspect', on, options.returnFocus])
    this.store.set({ inspecting: on, loadStatus: 'idle' })
  }
  setInspecting(on, options) { this.resumeInspecting(on, options) }
  resumeBroken(broken) {
    calls.push(['rule', broken])
    this.store.set({ broken, ruleStatus: 'idle' })
  }
  setBroken(value) { this.resumeBroken(value) }
  setBrand(hue) { calls.push(['hue', hue]) }
  showUsers(path) { calls.push(['users', path]) }
  clearUsers() { calls.push(['clear-users']) }
  traceTokens(path) { calls.push(['trace', path]); return path }
  motionChanged() { calls.push(['motion', this.store.getState().motion]) }
}
const loaded = { InspectorRuntime: Runtime }
const commands = (name) => calls.filter(([kind]) => kind === name)

test('motion preferences work without requesting inspection code', () => {
  let downloads = 0
  const controller = new InspectorController(config, () => { downloads++; return Promise.resolve(loaded) })
  controller.attach(surfaces)
  controller.setMotion('reduced')
  assert.equal(controller.getState().motion, 'reduced')
  assert.equal(document.documentElement.dataset.motion, 'reduced')
  assert.equal(storage.get('ml:motion'), 'reduced')
  controller.setMotion('slow')
  assert.equal(storage.get('ml:motion'), 'reduced')
  controller.setMotion('default')
  assert.equal(storage.has('ml:motion'), false)
  reduced.matches = true
  reduced.dispatchEvent(new Event('change'))
  assert.equal(controller.getState().motion, 'reduced')
  assert.equal(downloads, 0)
  controller.destroy()
})

test('Escape cancels before the runtime arrives and preserves the initiating focus', async () => {
  const download = deferred()
  const controller = new InspectorController(config, () => download.promise)
  controller.attach(surfaces)
  const trigger = document.activeElement
  const pending = controller.setInspecting(true, { returnFocus: trigger })
  assert.equal(controller.getState().loadStatus, 'loading')
  assert.equal(controller.getState().inspecting, true)
  const escape = Object.assign(new Event('keydown', { cancelable: true }), { key: 'Escape' })
  document.dispatchEvent(escape)
  assert.equal(escape.defaultPrevented, true)
  assert.equal(controller.getState().inspecting, false)
  download.resolve(loaded)
  await pending
  await flush()
  assert.equal(commands('inspect').length, 0)
  assert.equal(document.activeElement, trigger)
  assert.equal('inspecting' in document.documentElement.dataset, false)
  controller.destroy()
})

test('cancel then reopen during one download activates only the latest request', async () => {
  const download = deferred()
  let downloads = 0
  const controller = new InspectorController(config, () => { downloads++; return download.promise })
  controller.attach(surfaces)
  const first = new Node(), latest = new Node()
  const old = controller.setInspecting(true, { returnFocus: first })
  await controller.setInspecting(false)
  const current = controller.setInspecting(true, { returnFocus: latest })
  download.resolve(loaded)
  await Promise.all([old, current])
  assert.deepEqual(commands('inspect'), [['inspect', true, latest]])
  assert.equal(downloads, 1)
  assert.equal(controller.getState().loadStatus, 'idle')
  controller.destroy()
})

test('cancelling a cold activation preserves a native page control already in focus', async () => {
  const download = deferred()
  const controller = new InspectorController(config, () => download.promise)
  controller.attach(surfaces)
  const pending = controller.setInspecting(true)
  const link = new Node()
  link.matchesSelectors.add('a[href], button, input, select, textarea, summary')
  link.matchesSelectors.add('#page-content')
  link.focus()
  await controller.setInspecting(false)
  await flush()
  assert.equal(document.activeElement, link)
  download.resolve(loaded)
  await pending
  controller.destroy()
})

test('cancelling after the initiating control leaves the page falls back to the header', async () => {
  const download = deferred()
  const controller = new InspectorController(config, () => download.promise)
  controller.attach(surfaces)
  const trigger = document.activeElement
  const pending = controller.setInspecting(true)
  trigger.isConnected = false
  const header = new Node()
  document.querySelector = () => header
  await controller.setInspecting(false)
  await flush()
  assert.equal(document.activeElement, header)
  download.resolve(loaded)
  await pending
  controller.destroy()
})

test('keyboard modality publishes only when the modality changes', () => {
  const controller = new InspectorController(config, () => Promise.resolve(loaded))
  controller.attach(surfaces)
  let updates = 0
  controller.subscribe(() => updates++)
  for (const key of ['Tab', 'ArrowRight', 'ArrowRight']) {
    document.dispatchEvent(Object.assign(new Event('keydown'), { key }))
  }
  assert.equal(updates, 1)
  document.dispatchEvent(new Event('pointerdown'))
  assert.equal(updates, 2)
  controller.destroy()
})

test('a failed runtime download exposes retry and a second attempt can activate', async () => {
  let downloads = 0
  const controller = new InspectorController(config, () => ++downloads === 1 ? Promise.reject(new Error('offline')) : Promise.resolve(loaded))
  controller.attach(surfaces)
  await controller.setInspecting(true)
  assert.equal(controller.getState().inspecting, false)
  assert.equal(controller.getState().loadStatus, 'error')
  assert.match(surfaces.live.textContent, /could not load/)
  await controller.setInspecting(true)
  assert.equal(downloads, 2)
  assert.equal(controller.getState().inspecting, true)
  assert.equal(controller.getState().loadStatus, 'idle')
  controller.destroy()
})

test('warm, hue changes and token hover share a download; latest hue and cleared hover win', async () => {
  const download = deferred()
  let downloads = 0
  const controller = new InspectorController(config, () => { downloads++; return download.promise })
  controller.attach(surfaces)
  controller.warm()
  controller.setBrand(100)
  controller.setBrand(240)
  controller.showUsers('semantic.color.accent.primary', { announce: true })
  controller.clearUsers()
  assert.equal(controller.getState().brand.hue, 240)
  download.resolve(loaded)
  await flush()
  assert.equal(downloads, 1)
  assert.deepEqual(commands('hue'), [['hue', 240]])
  assert.equal(commands('users').length, 0)
  controller.destroy()
})

test('the runtime receives the latest slot, route and motion after loading', async () => {
  const download = deferred()
  const controller = new InspectorController(config, () => download.promise)
  controller.attach(surfaces)
  const old = new Node(), current = new Node()
  controller.registerSlot(old)
  controller.routeChanged('/')
  controller.warm()
  controller.registerSlot(current)
  controller.routeChanged('/system')
  controller.setMotion('reduced')
  download.resolve(loaded)
  await flush()
  assert.deepEqual(commands('slot'), [['slot', current]])
  assert.deepEqual(commands('route'), [['route', '/system']])
  assert.equal(instances[0].store.getState().motion, 'reduced')
  controller.setMotion('default')
  assert.deepEqual(commands('motion'), [['motion', 'default']])
  controller.destroy()
})

test('disposal rejects a stale download without overwriting a new attachment', async () => {
  const first = deferred(), second = deferred()
  let downloads = 0
  const controller = new InspectorController(config, () => ++downloads === 1 ? first.promise : second.promise)
  controller.attach(surfaces)
  const old = controller.setInspecting(true)
  controller.destroy()
  assert.equal(controller.getState().inspecting, false)
  controller.attach(surfaces)
  const current = controller.setInspecting(true)
  first.resolve(loaded)
  await old
  assert.equal(instances.length, 0)
  assert.equal(controller.getState().loadStatus, 'loading')
  second.resolve(loaded)
  await current
  assert.equal(instances.length, 1)
  assert.equal(controller.getState().loadStatus, 'idle')
  controller.destroy()
})

test('a rule request stays unchanged on failure and ignores repeated presses until retry', async () => {
  const first = deferred()
  let downloads = 0
  const controller = new InspectorController(config, () => ++downloads === 1 ? first.promise : Promise.resolve(loaded))
  controller.attach(surfaces)
  const pending = controller.toggleBroken()
  await controller.toggleBroken()
  assert.equal(downloads, 1)
  assert.equal(controller.getState().broken, false)
  assert.equal(controller.getState().check.exit, 0)
  first.reject(new Error('offline'))
  await pending
  assert.equal(controller.getState().ruleStatus, 'error')
  assert.equal(controller.getState().broken, false)
  await controller.toggleBroken()
  assert.equal(downloads, 2)
  assert.deepEqual(commands('rule'), [['rule', true]])
  controller.destroy()
})

test('system appearance follows OS changes until explicitly overridden, without loading inspection', () => {
  let downloads = 0
  light.matches = true
  const controller = new InspectorController(config, () => { downloads++; return Promise.resolve(loaded) })
  assert.equal(controller.getState().contextReady, false)
  controller.attach(surfaces)
  assert.equal(controller.getState().contextReady, true)
  assert.equal(controller.getState().theme, 'light')
  assert.equal(controller.getState().themePreference, 'system')
  controller.setTheme('dark')
  assert.equal(storage.get('ml:theme'), 'dark')
  light.dispatchEvent(new Event('change'))
  assert.equal(controller.getState().theme, 'dark')
  controller.setTheme('system')
  assert.equal(storage.has('ml:theme'), false)
  assert.equal(controller.getState().theme, 'light')
  light.matches = false
  light.dispatchEvent(new Event('change'))
  assert.equal(controller.getState().theme, 'dark')
  assert.equal(downloads, 0)
  controller.destroy()
  light.matches = true
  light.dispatchEvent(new Event('change'))
  assert.equal(controller.getState().theme, 'dark')
})

test('appearance remains selectable when storage is denied and rapid changes clear their transition guard', async () => {
  localStorage.setItem = () => { throw new Error('Storage denied') }
  const controller = new InspectorController(config)
  controller.attach(surfaces)
  controller.setTheme('light')
  controller.setTheme('dark')
  controller.setTheme('light')
  light.dispatchEvent(new Event('change'))
  assert.equal(controller.getState().theme, 'light')
  assert.equal(document.documentElement.dataset.theme, 'light')
  await flush()
  assert.equal(document.documentElement.dataset.themeChanging, undefined)
  controller.destroy()
})

test('another tab updates appearance, browser chrome and an already loaded inspector', async () => {
  const metas = [{ content: '' }, { content: '' }]
  document.querySelectorAll = () => metas
  const controller = new InspectorController(config, () => Promise.resolve(loaded))
  controller.attach(surfaces)
  controller.warm()
  await flush()
  storage.set('ml:theme', 'light')
  window.dispatchEvent(Object.assign(new Event('storage'), { key: 'ml:theme' }))
  assert.equal(controller.getState().theme, 'light')
  assert.equal(controller.getState().themePreference, 'light')
  assert.ok(metas.every(meta => meta.content === config.themeColors.light))
  assert.deepEqual(commands('theme'), [['theme', 'light']])
  controller.destroy()
  storage.set('ml:theme', 'dark')
  window.dispatchEvent(Object.assign(new Event('storage'), { key: 'ml:theme' }))
  assert.equal(controller.getState().theme, 'light')
})
