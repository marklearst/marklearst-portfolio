import type { Stranded } from '@/lib/inspector/engine'
import type { BrandReport } from '@/lib/inspector/rebrand'
import type { CheckSummary, Inspection, ResolvedChain } from '@/lib/inspector/types'
import type { InspectorRuntime } from './inspector-runtime'

import { THEME_KEY, themePreference, resolveTheme, type Theme, type ThemePreference } from '../../lib/theme-preference.mjs'

/** The motion context: as designed, off, or every duration at a quarter of its speed for a close look. */
export type Motion = 'default' | 'reduced' | 'slow'

/** A stored preference, or nothing where the browser refuses storage, as it can in a private window. */
function stored(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export interface InspectorState {
  contextReady: boolean
  inspecting: boolean
  loadStatus: 'idle' | 'loading' | 'error'
  ruleStatus: 'idle' | 'loading' | 'error'
  pinned: boolean
  selection: Inspection | null
  /** Changes with every new selection. */
  selectionId: number
  /** True when this selection should resolve row by row instead of appearing at once. */
  animate: boolean
  /** The token whose users are outlined, and how many there are on the page. */
  lit: { path: string; count: number } | null
  check: CheckSummary
  broken: boolean
  /** The broken token's chain, once the engine has loaded. */
  brokenChain: ResolvedChain | null
  /** The token the broken one referenced before it held a literal. */
  severed: string | null
  /** That token on its own, as it resolves now. It keeps changing with the brand. The broken one no longer hears about it. */
  severedChain: ResolvedChain | null
  theme: 'dark' | 'light'
  themePreference: ThemePreference
  motion: Motion
  floating: boolean
  /** The accent as it stands: the built color until a visitor moves the hue. */
  brand: BrandReport
  brandPreview: { chain: ResolvedChain; foreground: string } | null
  /** Set when a rebrand has moved on without the broken token. */
  stranded: Stranded | null
  /** True while the visitor is driving with the keyboard, so the dock can show the keys that matter. */
  keyboard: boolean
  /** The side of the screen the floating dock sits on. It crosses over when it would cover what has focus. */
  side: 'right' | 'left'
}

/** Facts from the build that the dock shows before the engine has loaded. */
export interface InspectorConfig {
  themeColors: Readonly<Record<Theme, string>>
  check: CheckSummary
  /** `semantic.duration.reveal` as each motion context resolves it. */
  reveal: Readonly<Record<Motion, string>>
  brand: {
    /** The accent as built. */
    built: BrandReport
    /** The highest hue the control offers. */
    max: number
  }
}

export interface InspectorSurfaces {
  /** Outlines are drawn here, in document coordinates. */
  overlay: HTMLElement
  /** Announcements for screen readers. */
  live: HTMLElement
}

export interface InspectorStore {
  getState(): InspectorState
  set(patch: Partial<InspectorState>): void
}

type RuntimeLoader = () => Promise<{ InspectorRuntime: typeof InspectorRuntime }>
const MOTION_KEY = 'ml:motion'

/** Keeps the first frame and motion preferences available before inspection machinery is requested. */
export class InspectorController {
  private state: InspectorState
  private listeners = new Set<() => void>()
  private runtime: InspectorRuntime | undefined
  private loading: Promise<InspectorRuntime> | undefined
  private loader: RuntimeLoader
  private config: InspectorConfig
  private surfaces: InspectorSurfaces | undefined
  private slot: HTMLElement | null = null
  private pathname: string | undefined
  private detach: (() => void) | undefined
  private generation = 0
  private activation = 0
  private returnFocus: HTMLElement | null = null
  private wanted: string | null = null
  private wantedHue = 0
  private pendingBrand = false
  private themeChange = 0

  readonly reveal: InspectorConfig['reveal']
  readonly brand: InspectorConfig['brand']

  constructor(config: InspectorConfig, loader: RuntimeLoader = () => import('./inspector-runtime')) {
    this.config = config
    this.loader = loader
    this.reveal = config.reveal
    this.brand = config.brand
    this.state = {
      contextReady: false,
      inspecting: false, loadStatus: 'idle', ruleStatus: 'idle', pinned: false,
      selection: null, selectionId: 0, animate: false, lit: null,
      check: config.check, broken: false, brokenChain: null, severed: null, severedChain: null,
      theme: 'dark', themePreference: 'system', motion: 'default', floating: false, brand: config.brand.built,
      brandPreview: null, stranded: null, keyboard: false, side: 'right',
    }
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  getState = () => this.state
  private set = (patch: Partial<InspectorState>) => {
    this.state = { ...this.state, ...patch }
    for (const listener of this.listeners) listener()
  }
  private announce(message: string) {
    if (this.surfaces) this.surfaces.live.textContent = message
  }

  attach(surfaces: InspectorSurfaces) {
    this.surfaces = surfaces
    const root = document.documentElement
    this.set({
      motion: root.dataset.motion === 'reduced' ? 'reduced' : root.dataset.motion === 'slow' ? 'slow' : 'default',
      theme: root.dataset.theme === 'light' ? 'light' : 'dark',
    })
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const followSystem = () => {
      if (!stored(MOTION_KEY)) this.applyMotion(reduced.matches ? 'reduced' : 'default')
    }
    reduced.addEventListener('change', followSystem)
    const light = window.matchMedia('(prefers-color-scheme: light)')
    this.applyTheme(themePreference(stored(THEME_KEY)), light.matches)
    this.set({ contextReady: true })
    const followTheme = () => {
      if (this.state.themePreference === 'system') this.applyTheme('system', light.matches)
    }
    const storedTheme = (event: StorageEvent) => {
      if (event.key === THEME_KEY || event.key === null) this.applyTheme(themePreference(stored(THEME_KEY)), light.matches)
    }
    light.addEventListener('change', followTheme)
    window.addEventListener('storage', storedTheme)
    const events = new AbortController()
    const { signal } = events
    document.addEventListener('keydown', this.onKeyDown, { signal })
    document.addEventListener('pointerdown', this.onPointerDown, { capture: true, signal })
    document.addEventListener('click', this.onPendingClick, { capture: true, signal })
    document.addEventListener('animationend', this.onAnimationEnd, { signal })
    document.addEventListener('animationcancel', this.onAnimationCancel, { signal })
    this.runtime?.attach(surfaces)
    this.detach = () => {
      events.abort()
      reduced.removeEventListener('change', followSystem)
      light.removeEventListener('change', followTheme)
      window.removeEventListener('storage', storedTheme)
    }
  }

  destroy() {
    this.themeChange += 1
    delete document.documentElement.dataset.themeChanging
    this.generation += 1
    this.activation += 1
    this.detach?.()
    this.detach = undefined
    this.runtime?.destroy()
    if (!this.runtime) {
      delete document.documentElement.dataset.inspecting
      this.set({ inspecting: false, loadStatus: 'idle', ruleStatus: 'idle', brand: this.brand.built })
    }
    this.loading = undefined
    this.surfaces = undefined
    this.pendingBrand = false
  }

  registerSlot(slot: HTMLElement | null) {
    this.slot = slot
    this.runtime?.registerSlot(slot)
  }

  routeChanged(pathname: string) {
    if (this.pathname !== undefined && pathname !== this.pathname) delete document.documentElement.dataset.intro
    this.pathname = pathname
    this.runtime?.routeChanged(pathname)
  }

  private load(): Promise<InspectorRuntime> {
    if (this.runtime) return Promise.resolve(this.runtime)
    if (this.loading) return this.loading
    const generation = this.generation
    const request = this.loader().then(({ InspectorRuntime }) => {
      if (generation !== this.generation) throw new Error('Inspector owner was disposed during loading.')
      const runtime = new InspectorRuntime(this.config, { getState: this.getState, set: this.set })
      if (this.surfaces) runtime.attach(this.surfaces)
      runtime.registerSlot(this.slot)
      if (this.pathname !== undefined) runtime.routeChanged(this.pathname)
      this.runtime = runtime
      return runtime
    }).catch((error) => {
      if (this.loading === request) this.loading = undefined
      throw error
    })
    this.loading = request
    return request
  }

  warm = () => {
    // A failed speculative download stays quiet. Explicit actions below own their retry feedback.
    void this.load().then((runtime) => runtime.warm()).catch(() => undefined)
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.runtime) return
    if (!this.state.keyboard && !['Alt', 'Control', 'Meta', 'Shift'].includes(event.key)) this.set({ keyboard: true })
    if (event.key === 'Escape' && this.state.inspecting && !event.defaultPrevented) {
      event.preventDefault()
      void this.setInspecting(false)
    }
  }
  private onPointerDown = () => {
    if (!this.runtime && this.state.keyboard) this.set({ keyboard: false })
  }
  private onPendingClick = (event: MouseEvent) => {
    if (this.runtime || !this.state.inspecting) return
    const target = event.target
    if (target instanceof Element && target.closest('#page-content') && !target.closest('[data-inspector-ui]')) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
  private onAnimationEnd = (event: AnimationEvent) => {
    if (event.animationName.includes('scan')) delete document.documentElement.dataset.intro
  }
  private onAnimationCancel = (event: AnimationEvent) => {
    if (!event.animationName.includes('scan') || !('intro' in document.documentElement.dataset)) return
    void Promise.allSettled(document.getAnimations().map((animation) => animation.finished))
      .then(() => { delete document.documentElement.dataset.intro })
  }

  setInspecting = async (on: boolean, options: { returnFocus?: HTMLElement | null } = {}) => {
    if (on === this.state.inspecting) return
    const activation = ++this.activation
    if (this.runtime) return this.runtime.setInspecting(on, options)
    if (!on) {
      const active = document.activeElement
      const kept = active instanceof HTMLElement
        && active.matches('a[href], button, input, select, textarea, summary')
        && active.closest('#page-content') && !active.closest('[data-inspector-ui]') ? active : null
      delete document.documentElement.dataset.inspecting
      this.set({ inspecting: false, loadStatus: 'idle' })
      this.announce('Inspect off.')
      const started = this.returnFocus
      this.returnFocus = null
      requestAnimationFrame(() => {
        if (activation !== this.activation) return
        const stays = (element: HTMLElement | null | undefined) => {
          if (!element?.isConnected || element.closest('[data-inspector-dock="floating"], [inert]')) return null
          const rect = element.getBoundingClientRect()
          return rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight ? element : null
        }
        const focus = stays(kept) ?? stays(options.returnFocus) ?? stays(started)
          ?? document.querySelector<HTMLElement>('header [aria-pressed]')
        focus?.focus({ preventScroll: true })
      })
      return
    }
    delete document.documentElement.dataset.intro
    this.returnFocus = options.returnFocus ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    document.documentElement.dataset.inspecting = ''
    this.set({ inspecting: true, loadStatus: 'loading' })
    this.announce('Loading inspector. Escape cancels.')
    try {
      const runtime = await this.load()
      if (activation !== this.activation) return
      return runtime.resumeInspecting(true, { returnFocus: this.returnFocus })
    } catch {
      if (activation !== this.activation) return
      await this.setInspecting(false)
      this.set({ loadStatus: 'error' })
      this.announce('The inspector could not load. Use Inspect to try again.')
    }
  }
  toggleInspecting = (returnFocus?: HTMLElement | null) => this.setInspecting(!this.state.inspecting, { returnFocus })

  setBroken = async (broken: boolean) => {
    if (broken === this.state.broken || this.state.ruleStatus === 'loading') return
    if (this.runtime) return this.runtime.setBroken(broken)
    const generation = this.generation
    delete document.documentElement.dataset.intro
    this.set({ ruleStatus: 'loading' })
    try {
      const runtime = await this.load()
      if (generation === this.generation) await runtime.resumeBroken(broken)
    } catch {
      if (generation !== this.generation) return
      this.set({ ruleStatus: 'error' })
      this.announce('The rule demo could not load. Try again.')
    }
  }
  toggleBroken = () => this.setBroken(!this.state.broken)

  setBrand = (hue: number) => {
    if (this.runtime) return this.runtime.setBrand(hue)
    delete document.documentElement.dataset.intro
    this.wantedHue = hue
    this.set({ brand: { ...this.state.brand, hue } })
    if (this.pendingBrand) return
    this.pendingBrand = true
    const generation = this.generation
    void this.load().then((runtime) => {
      if (generation !== this.generation) return
      this.pendingBrand = false
      runtime.setBrand(this.wantedHue)
    }).catch(() => {
      if (generation !== this.generation) return
      this.pendingBrand = false
      this.set({ brand: this.brand.built })
      this.announce('The live token engine could not load. Try changing the accent again.')
    })
  }
  resetBrand = () => this.setBrand(this.brand.built.hue)

  showUsers = (path: string, options: { announce?: boolean } = {}) => {
    this.wanted = path
    if (this.runtime) return this.runtime.showUsers(path, options)
    const generation = this.generation
    void this.load().then((runtime) => {
      if (generation === this.generation && this.wanted === path) runtime.showUsers(path, options)
    }).catch(() => {
      if (generation === this.generation && this.wanted === path && options.announce) {
        this.announce('The live token engine could not load. Select the token to try again.')
      }
    })
  }
  clearUsers = () => {
    this.wanted = null
    this.runtime?.clearUsers()
  }
  traceTokens = async (path: string) => (await this.load()).traceTokens(path)

  private applyTheme(preference: ThemePreference, light: boolean) {
    const theme = resolveTheme(preference, light)
    const root = document.documentElement
    const changed = root.dataset.theme !== theme
    const contextChanged = this.state.theme !== theme
    if (changed) root.dataset.themeChanging = ''
    root.dataset.theme = theme
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) meta.content = this.config.themeColors[theme]
    this.set({ theme, themePreference: preference })
    if (contextChanged) this.runtime?.themeChanged()
    if (changed) {
      const change = ++this.themeChange
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (change === this.themeChange) delete root.dataset.themeChanging
      }))
    }
  }

  setTheme = (preference: ThemePreference) => {
    try {
      if (preference === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, preference)
    } catch { /* The choice still applies when storage is unavailable. */ }
    this.applyTheme(preference, window.matchMedia('(prefers-color-scheme: light)').matches)
  }

  private applyMotion(motion: Motion) {
    document.documentElement.dataset.motion = motion
    this.set({ motion })
    this.runtime?.motionChanged()
  }
  setMotion = (motion: Motion) => {
    const system: Motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'default'
    try {
      if (motion !== 'slow') {
        if (motion === system) localStorage.removeItem(MOTION_KEY)
        else localStorage.setItem(MOTION_KEY, motion)
      }
    } catch { /* The choice still applies when storage is unavailable. */ }
    this.applyMotion(motion)
    this.announce(motion === 'reduced'
      ? 'Reduced motion on. Every duration token now routes to 0 milliseconds.'
      : motion === 'slow'
        ? 'Slow motion on. Every duration token now runs at a quarter of its speed.'
        : 'Default motion restored.')
  }

  inspectedElement = () => this.runtime?.inspectedElement() ?? null

  togglePin = () => this.runtime?.togglePin()
  takeSnap = () => this.runtime?.takeSnap() ?? false
  crossOver = () => this.runtime?.crossOver()
  grab = (event: PointerEvent, dock: HTMLElement) => this.runtime?.grab(event, dock)
  stopHandoff = (dock: HTMLElement) => this.runtime?.stopHandoff(dock)
  playHandoff = (dock: HTMLElement) => this.runtime?.playHandoff(dock)
}
