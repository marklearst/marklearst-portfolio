import type { Engine, Stranded } from '@/lib/inspector/engine'
import { durationMs, easing, numberToken } from '@/lib/motion-tokens'
import { createSpring, type Spring } from '@/lib/spring'
import type { BrandReport } from '@/lib/inspector/rebrand'
import type { CheckSummary, ContextSelection, Contrast, Inspection, ResolvedChain } from '@/lib/inspector/types'

// The inspector's state and its work on the page. React renders the dock from
// the state; this class owns everything that happens outside React's tree:
// listening to the page, measuring elements, and moving the outlines.

/** The motion context: as designed, off, or every duration at a quarter of its speed for a close look. */
export type Motion = 'default' | 'reduced' | 'slow'

/** A token chain the dock shows before anything is selected. */
export interface PreviewProperty {
  id: string
  label: string
  path: string
  chain: ResolvedChain
  contrast?: Contrast
}

/** What the dock shows at rest: the tokens behind one element. The page marks that element with `data-inspect-preview`, and it is the first thing selected when inspecting starts. */
export interface Preview {
  label: string
  properties: readonly PreviewProperty[]
}

export interface InspectorState {
  inspecting: boolean
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
  motion: Motion
  floating: boolean
  /** The accent as it stands: the built color until a visitor moves the hue. */
  brand: BrandReport
  /** Set when a rebrand has moved on without the broken token. */
  stranded: Stranded | null
  /** True while the visitor is driving with the keyboard, so the dock can show the keys that matter. */
  keyboard: boolean
  /** The side of the screen the floating dock sits on. It crosses over when it would cover what has focus. */
  side: 'right' | 'left'
}

/** Facts from the build that the dock shows before the engine has loaded. */
export interface InspectorConfig {
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

const SCOPE = '#page-content'
const UI = '[data-inspector-ui]'
/** Controls a browser focuses on its own. */
const CONTROLS = 'a[href], button, input, select, textarea, summary'
const NATIVE_FOCUS = `${CONTROLS}, [tabindex]`
/** Content that gets a tab stop while inspecting, so the keyboard reaches what a pointer can. */
const TAB_STOPS = 'h1, h2, h3, h4, h5, h6, p, li, img, blockquote, pre, dt, dd, th, td, figcaption'
const WRAPPERS = new Set(['span', 'strong', 'em', 'b', 'i', 'small', 'mark', 'br', 'wbr'])
/** What a dock holds that can take focus, in the order both docks render it. */
const FOCUSABLE = 'button, a[href], input'
const DOCK = '[data-inspector-dock]:not([data-away])'
const FLOATING_DOCK = '[data-inspector-dock="floating"]'
const NARROW = '(max-width: 959px)'
const MOTION_KEY = 'ml:motion'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export class InspectorController {
  private state: InspectorState
  private listeners = new Set<() => void>()
  private engine: Engine | undefined
  private loading: Promise<Engine> | undefined
  private surfaces: InspectorSurfaces | undefined
  private target: Element | null = null
  private box: HTMLElement | undefined
  /** Carries the selection's outline from one element to the next: x, y, width, height. */
  private glide: Spring | undefined
  private boxLabel: HTMLElement | undefined
  private hoverBox: HTMLElement | undefined
  private ghosts: HTMLElement | undefined
  private slot: HTMLElement | null = null
  private slotRatio = 1
  private slotObserver: IntersectionObserver | undefined
  private resizeObserver: ResizeObserver | undefined
  private frame = 0
  private pending: Element | null = null
  private pointerSelecting = false
  private pointerTimer = 0
  /** Counts selections, so a slow read of one element never lands after the visitor has moved to the next. */
  private ticket = 0
  /** The elements the lit token paints, kept so a resize can redraw their outlines without finding them again. */
  private litUsers: Element[] = []
  /** Set when a rule has just been broken, until the dock has shown it break. */
  private snapped = false
  /** When the dock was last let go of, plus a moment. */
  private dropped = 0
  /** A floating dock that was thrown to the other side, waiting for its new place so it can land there. */
  private thrown: { from: DOMRect; velocity: number; spring: Spring } | null = null
  /** Elements hanging crooked because the token that paints them lost its reference. */
  private unhooked = new Set<HTMLElement | SVGElement>()
  private pathname: string | undefined
  private warmed = false
  private lastSelect = -Infinity
  private returnFocus: HTMLElement | null = null
  private handoff: DOMRect | null = null
  /** Where keyboard focus sat among the leaving dock's controls, so the arriving dock can take it over. */
  private focusIndex = -1
  private wanted: string | null = null
  private wantedHue = 0
  private brandFrame = 0
  private detach: (() => void) | undefined

  readonly reveal: InspectorConfig['reveal']
  readonly brand: InspectorConfig['brand']

  constructor({ check, reveal, brand }: InspectorConfig) {
    this.reveal = reveal
    this.brand = brand
    this.state = {
      inspecting: false,
      pinned: false,
      selection: null,
      selectionId: 0,
      animate: false,
      lit: null,
      check,
      broken: false,
      brokenChain: null,
      severed: null,
      severedChain: null,
      theme: 'dark',
      motion: 'default',
      floating: false,
      brand: brand.built,
      stranded: null,
      keyboard: false,
      side: 'right',
    }
  }

  // Store

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  getState = () => this.state

  private set(patch: Partial<InspectorState>) {
    this.state = { ...this.state, ...patch }
    for (const listener of this.listeners) listener()
  }

  // Lifecycle

  attach(surfaces: InspectorSurfaces) {
    this.surfaces = surfaces
    const make = (className: string) => {
      const node = document.createElement('div')
      node.dataset.part = className
      surfaces.overlay.append(node)
      return node
    }
    this.ghosts = make('ghosts')
    this.hoverBox = make('hover')
    this.box = make('box')
    this.boxLabel = document.createElement('span')
    this.boxLabel.dataset.part = 'label'
    this.box.append(this.boxLabel)
    const box = this.box
    // A spring, because the pointer sends the outline somewhere new before it has arrived, and it should keep its speed.
    this.glide = createSpring(
      ([x, y, width, height]) => {
        box.style.transform = `translate(${x}px, ${y}px)`
        box.style.width = `${width}px`
        box.style.height = `${height}px`
      },
      () => durationMs('--component-inspector-motion'),
      numberToken('--spring-land'),
    )

    const root = document.documentElement
    this.set({
      motion: root.dataset.motion === 'reduced' ? 'reduced' : root.dataset.motion === 'slow' ? 'slow' : 'default',
      theme: root.dataset.theme === 'light' ? 'light' : 'dark',
    })

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const followSystem = () => {
      if (!localStorage.getItem(MOTION_KEY)) this.applyMotion(reduced.matches ? 'reduced' : 'default')
    }
    const narrow = window.matchMedia(NARROW)
    const onNarrow = () => this.updateFloating()
    reduced.addEventListener('change', followSystem)
    narrow.addEventListener('change', onNarrow)

    const controller = new AbortController()
    const { signal } = controller
    document.addEventListener('pointerover', this.onPointerOver, { signal })
    document.addEventListener('pointerdown', this.onPointerDown, { capture: true, signal })
    document.addEventListener('pointerup', this.onPointerEnd, { capture: true, signal })
    document.addEventListener('pointercancel', this.onPointerEnd, { capture: true, signal })
    document.addEventListener('click', this.onClick, { capture: true, signal })
    document.addEventListener('focusin', this.onFocusIn, { signal })
    document.addEventListener('keydown', this.onKeyDown, { signal })
    document.addEventListener('animationend', this.onAnimationEnd, { signal })
    document.addEventListener('animationcancel', this.onAnimationCancel, { signal })
    window.addEventListener('resize', this.reposition, { signal })
    window.addEventListener('scroll', this.onScroll, { passive: true, signal })
    this.resizeObserver = new ResizeObserver(this.reposition)
    this.resizeObserver.observe(document.body)

    this.detach = () => {
      controller.abort()
      reduced.removeEventListener('change', followSystem)
      narrow.removeEventListener('change', onNarrow)
      this.resizeObserver?.disconnect()
      this.slotObserver?.disconnect()
      cancelAnimationFrame(this.frame)
      cancelAnimationFrame(this.brandFrame)
      clearTimeout(this.pointerTimer)
      this.glide?.stop()
      surfaces.overlay.replaceChildren()
    }
  }

  destroy() {
    this.detach?.()
    this.detach = undefined
    this.surfaces = undefined
  }

  /** The dock in the page registers the space it lives in, so the floating dock knows when to take over. */
  registerSlot(slot: HTMLElement | null) {
    this.slotObserver?.disconnect()
    this.slot = slot
    this.slotRatio = slot ? 1 : 0
    if (slot) {
      this.slotObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) this.slotRatio = entry.intersectionRatio
          this.updateFloating()
          this.syncBroken()
        },
        { rootMargin: '-80px 0px 0px 0px', threshold: [0, 0.15, 0.3, 0.35, 0.5, 0.65, 0.7, 0.85, 1] },
      )
      this.slotObserver.observe(slot)
    }
    this.updateFloating()
    this.syncBroken()
  }

  /** Called on each route change: the old page's elements are gone, and its stylesheets may be too. */
  routeChanged(pathname: string) {
    // The first route is the page the visitor arrived on. Any other ends the session's intro.
    if (this.pathname !== undefined && this.pathname !== pathname) this.endIntro()
    this.pathname = pathname
    this.unhooked.clear()
    this.ticket += 1
    this.target = null
    this.hide(this.box)
    this.hide(this.hoverBox)
    this.clearGhosts()
    if (this.state.lit) this.set({ lit: null })
    if (!this.state.inspecting) {
      this.syncBroken()
      return
    }
    this.set({ selection: null, pinned: false, lit: null })
    this.setTabStops(true)
    requestAnimationFrame(() => {
      const first = this.firstInView()
      if (this.state.inspecting && first) this.select(first, { animate: true })
    })
  }

  // Engine

  private scope() {
    return document.querySelector<HTMLElement>(SCOPE)
  }

  private excluded = (element: Element) => Boolean(element.closest(UI))

  private load(): Promise<Engine> {
    this.loading ??= import('@/lib/inspector/engine').then(({ createEngine }) => {
      this.engine = createEngine(this.excluded)
      return this.engine
    })
    return this.loading
  }

  /** Starts loading the engine and, once the browser is idle, has it read the stylesheets, so the first real interaction waits for neither. */
  warm = () => {
    if (this.warmed) return
    this.warmed = true
    void this.load().then((engine) => {
      const whenIdle = window.requestIdleCallback ?? ((work: () => void) => window.setTimeout(work, 0))
      whenIdle(() => engine.prepare())
    })
  }

  private selection(): ContextSelection {
    const root = document.documentElement
    return {
      theme: root.dataset.theme === 'light' ? 'light' : 'dark',
      motion: root.dataset.motion === 'reduced' ? 'reduced' : root.dataset.motion === 'slow' ? 'slow' : 'default',
    }
  }

  private announce(message: string) {
    if (this.surfaces) this.surfaces.live.textContent = message
  }

  // Inspect

  setInspecting = async (on: boolean, options: { returnFocus?: HTMLElement | null } = {}) => {
    if (on === this.state.inspecting) return
    if (on) {
      this.endIntro()
      this.returnFocus = options.returnFocus ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
      document.documentElement.dataset.inspecting = ''
      this.clearGhosts()
      this.set({ inspecting: true, pinned: false, lit: null })
      this.updateFloating()
      await this.load()
      // The mode change paints before the page is read, so the control that started it answers at once.
      await painted()
      if (!this.state.inspecting) return
      this.setTabStops(true)
      const preview = this.scope()?.querySelector('[data-inspect-preview]')
      const first = preview && this.inView(preview) ? preview : this.firstInView()
      if (first) this.select(first, { animate: true })
      this.announce('Inspect on. Tab to anything on the page, or point at it. Enter reads its tokens. Links are paused. Escape stops.')
    } else {
      // A link or button on the page keeps focus through this. Content that only took focus for inspecting can't.
      const active = document.activeElement
      const kept = active instanceof HTMLElement && active.matches(CONTROLS) && this.inScope(active) ? active : null
      delete document.documentElement.dataset.inspecting
      this.setTabStops(false)
      this.ticket += 1
      this.target = null
      this.hide(this.box)
      this.hide(this.hoverBox)
      this.clearGhosts()
      this.set({ inspecting: false, pinned: false, selection: null, lit: null, side: 'right' })
      this.updateFloating()
      this.syncBroken()
      this.announce('Inspect off.')
      const started = this.returnFocus
      this.returnFocus = null
      // Wait for the docks to settle: until then the one in the page is still inert and can't take focus.
      requestAnimationFrame(() => {
        if (this.state.inspecting) return
        // Focus stays put when it can, else goes to the control that ended this, else to the one that started it,
        // else to the header's toggle. Nothing in a dock that is leaving or switched off qualifies.
        const stays = (element: HTMLElement | null | undefined) =>
          element?.isConnected && !element.closest(`${FLOATING_DOCK}, [inert]`) && this.onScreen(element) ? element : null
        const focus = stays(kept) ?? stays(options.returnFocus) ?? stays(started) ?? document.querySelector<HTMLElement>('header [aria-pressed]')
        focus?.focus({ preventScroll: true })
      })
    }
  }

  toggleInspecting = (returnFocus?: HTMLElement | null) => this.setInspecting(!this.state.inspecting, { returnFocus })

  unpin = () => {
    this.set({ pinned: false })
    this.announce('Selection unpinned. Point at anything to explore.')
  }

  /** Holds the dock on the element it shows, or lets it follow the pointer again. */
  togglePin = () => {
    if (this.state.pinned) this.unpin()
    else if (this.target) {
      this.set({ pinned: true })
      this.announce('Selection pinned.')
    }
  }

  private inScope(element: Element | null): element is Element {
    return Boolean(element && this.scope()?.contains(element) && !this.excluded(element))
  }

  /** The element worth inspecting under a pointer or focus: the nearest one that isn't a bare text wrapper. */
  private pick(node: EventTarget | null): Element | null {
    if (!(node instanceof Element) || !this.inScope(node)) return null
    let element: Element = node.closest('svg') ?? node
    while (WRAPPERS.has(element.localName) && !element.classList.length && element.parentElement && this.inScope(element.parentElement)) {
      element = element.parentElement
    }
    // The wrapper around the whole page is not a thing on the page.
    return element === this.scope() ? null : element
  }

  private inView(element: Element) {
    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.top >= this.headerBottom() && rect.bottom <= window.innerHeight
  }

  private onScreen(element: Element) {
    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight
  }

  private firstInView() {
    const scope = this.scope()
    if (!scope) return null
    for (const element of scope.querySelectorAll(TAB_STOPS)) {
      if (this.inScope(element) && this.inView(element)) return element
    }
    return null
  }

  private headerBottom() {
    return document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
  }

  private select(element: Element, options: { announce?: boolean; pin?: boolean; animate?: boolean; force?: boolean; refresh?: boolean } = {}) {
    const engine = this.engine
    if (!engine) return
    const changed = options.force || element !== this.target
    const now = performance.now()
    // A pointer that rested for longer than one reveal earns the row by row resolve. One that is sweeping past does not.
    const animate = options.animate ?? (now - this.lastSelect > durationMs('--semantic-duration-reveal'))
    this.target = element
    this.hide(this.hoverBox)
    if (!changed) {
      if (options.pin !== undefined && options.pin !== this.state.pinned) this.set({ pinned: options.pin })
      return
    }
    if (!options.refresh) this.clearGhosts()
    this.lastSelect = now
    // The outline answers in this frame. Reading the element's tokens takes longer, so it follows in the next one.
    this.place(this.box, element, 6, { label: engine.label(element), glide: options.animate !== false && !options.announce })
    if (options.pin !== undefined && options.pin !== this.state.pinned) this.set({ pinned: options.pin })
    const ticket = ++this.ticket
    void painted().then(() => {
      if (ticket !== this.ticket || !element.isConnected) return
      const selection = engine.inspect(element, this.selection())
      // A fast Tab can reach the dock before this lands. The rows it landed on are about to be replaced.
      const reading = Boolean(document.activeElement?.closest(DOCK))
      // A refresh is the same element read again, so the dock keeps its rows and whatever control is in use.
      if (options.refresh) this.set({ selection, animate: false })
      else this.set({ selection, selectionId: this.state.selectionId + 1, animate: animate && !prefersReducedMotionContext(), lit: null })
      if (options.announce) this.announce(summarize(selection))
      if (reading && !options.refresh) requestAnimationFrame(() => this.keepReading())
    })
  }

  /** Puts focus on the first token of the selection when the rows that held it were replaced under it. */
  private keepReading() {
    if (document.activeElement && document.activeElement !== document.body) return
    const dock = document.querySelector(DOCK)
    const first = dock?.querySelector<HTMLElement>('[data-token-row]') ?? dock?.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus({ preventScroll: true })
  }

  private setTabStops(on: boolean) {
    const scope = this.scope()
    if (!scope) return
    for (const element of document.querySelectorAll('[data-inspect-tab]')) {
      element.removeAttribute('tabindex')
      element.removeAttribute('data-inspect-tab')
    }
    if (!on) return
    // Every candidate is measured before any is changed, so the browser lays the page out once.
    const stops = [...scope.querySelectorAll<HTMLElement>(TAB_STOPS)].filter((element) => this.worthAStop(element))
    for (const element of stops) {
      element.setAttribute('tabindex', '0')
      element.setAttribute('data-inspect-tab', '')
    }
  }

  /** Content gets a stop when a person could see it and nothing around it already takes focus. */
  private worthAStop(element: HTMLElement) {
    if (!this.inScope(element) || element.matches(NATIVE_FOCUS)) return false
    if (element.closest('[aria-hidden="true"]') || element.parentElement?.closest(CONTROLS)) return false
    // An image with empty alt text is decoration, and says so.
    if (element instanceof HTMLImageElement && !element.alt) return false
    const rect = element.getBoundingClientRect()
    // Text hidden for screen readers is clipped to a pixel. Focus there would vanish.
    return rect.width > 1 && rect.height > 1
  }

  private onPointerDown = () => {
    clearTimeout(this.pointerTimer)
    this.pointerSelecting = true
    if (this.state.keyboard) this.set({ keyboard: false })
  }

  // A touch sends its mouse events and its click well after the finger lifts. The flag holds through all of them.
  private onPointerEnd = () => {
    clearTimeout(this.pointerTimer)
    // raw: the longest a browser waits to send a touch's click. Input timing, not motion, so reduced motion must not zero it.
    this.pointerTimer = window.setTimeout(() => {
      this.pointerSelecting = false
    }, 400)
  }

  private onPointerOver = (event: PointerEvent) => {
    if (!this.state.inspecting || event.pointerType === 'touch') return
    // Letting go of the dock leaves the pointer over whatever was under it. That is not a choice of something to inspect.
    if (performance.now() < this.dropped) return
    const element = this.pick(event.target)
    if (!element) {
      this.hide(this.hoverBox)
      return
    }
    if (this.state.pinned) {
      if (element === this.target) this.hide(this.hoverBox)
      else this.place(this.hoverBox, element, 4, { glide: true })
      return
    }
    if (element === this.target) return
    this.pending = element
    this.frame ||= requestAnimationFrame(() => {
      this.frame = 0
      if (this.state.inspecting && !this.state.pinned && this.pending) this.select(this.pending)
      this.pending = null
    })
  }

  private onClick = (event: MouseEvent) => {
    // The click is the last thing a pointer press sends. Focus that arrives after it is the keyboard's.
    if (event.detail > 0) {
      clearTimeout(this.pointerTimer)
      this.pointerTimer = window.setTimeout(() => {
        this.pointerSelecting = false
      }, 0)
    }
    if (!this.state.inspecting) return
    const element = this.pick(event.target)
    if (!element) return
    // While inspecting, the page is something to look at. Links don't follow and controls don't fire.
    event.preventDefault()
    event.stopPropagation()
    if (element === this.target && this.state.pinned && event.detail > 0) {
      this.unpin()
      return
    }
    this.select(element, { announce: true, pin: true, animate: true, force: element !== this.target })
  }

  private onFocusIn = (event: FocusEvent) => {
    if (!this.state.inspecting) return
    if (!this.pointerSelecting) {
      const element = this.pick(event.target)
      // Keyboard moves are instant: no glide, no row by row resolve.
      if (element) this.select(element, { announce: true, pin: true, animate: false })
      this.makeWayFor(event.target)
    }
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (!['Alt', 'Control', 'Meta', 'Shift'].includes(event.key) && !this.state.keyboard) this.set({ keyboard: true })
    if (!this.state.inspecting || event.defaultPrevented) return
    const active = document.activeElement
    if (event.key === 'Escape') {
      event.preventDefault()
      // From the dock, Escape steps back to the element it describes. From the page, it stops inspecting.
      const target = this.target
      if (active?.closest(DOCK) && target instanceof HTMLElement && target.isConnected && target.matches(NATIVE_FOCUS)) {
        target.focus()
        return
      }
      void this.setInspecting(false)
      return
    }
    // Enter on the selected element steps into the dock, to the first token that paints it.
    if (event.key === 'Enter' && active === this.target && this.inScope(active) && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const dock = document.querySelector(DOCK)
      const first = dock?.querySelector<HTMLElement>('[data-token-row]') ?? dock?.querySelector<HTMLElement>(FOCUSABLE)
      if (!first) return
      event.preventDefault()
      first.focus()
    }
  }

  // The intro is over when the hero's X-ray has finished its scan, which is the last thing in it to finish.
  // Leaving the attribute up would replay the intro each time the hero or the dock's preview came back.
  private onAnimationEnd = (event: AnimationEvent) => {
    if (event.animationName.includes('scan')) this.endIntro()
    const element = event.target
    if (!(element instanceof HTMLElement || element instanceof SVGElement) || !this.unhooked.has(element)) return
    // The swing is over. From here it just hangs, with no animation holding it.
    if (event.animationName === 'unhook') element.setAttribute('data-unhooked', 'hung')
    else if (event.animationName === 'rehook') this.release(element)
  }

  // A visitor who takes the hero's line mid scan cancels it, so it never ends. Whatever else the intro still has
  // running plays out, and then the intro is over.
  private onAnimationCancel = (event: AnimationEvent) => {
    if (!event.animationName.includes('scan') || !('intro' in document.documentElement.dataset)) return
    void Promise.allSettled(document.getAnimations().map((animation) => animation.finished)).then(() => this.endIntro())
  }

  private endIntro() {
    delete document.documentElement.dataset.intro
  }

  /**
   * Moves the floating dock to the other side of the screen when it sits on top of what has focus.
   * A keyboard can't push a dock out of the way, so the dock gets out of the way itself.
   * Returns true when the dock is crossing over.
   */
  private makeWayFor(node: EventTarget | null, options: { arriving?: boolean } = {}): boolean {
    if (!this.state.floating || window.matchMedia(NARROW).matches) return false
    // Only the dock's own controls are exempt. The page's inspect buttons are inspector controls too, and the dock
    // must not land on the one that opened it.
    if (!(node instanceof Element) || node === document.body || node.closest(FLOATING_DOCK)) return false
    const dock = document.querySelector<HTMLElement>(FLOATING_DOCK)
    if (!dock) return false
    const here = dock.getBoundingClientRect()
    // The same box, mirrored to the other side.
    const across = new DOMRect(window.innerWidth - here.right, here.top, here.width, here.height)
    const rect = node.getBoundingClientRect()
    if (covered(rect, here) < 0.5 || covered(rect, across) >= covered(rect, here)) return false
    // A dock that is still arriving keeps the starting point it was handed. One at rest starts from where it sits.
    if (!options.arriving) this.handoff = here
    this.set({ side: this.state.side === 'right' ? 'left' : 'right' })
    return true
  }

  private onScroll = () => {
    if (this.frame || !this.state.inspecting || !this.target) return
    this.frame = requestAnimationFrame(() => {
      this.frame = 0
      if (this.target && this.box) this.box.dataset.labelBelow = String(this.target.getBoundingClientRect().top - 36 < this.headerBottom())
    })
  }

  // Outlines

  private place(node: HTMLElement | undefined, element: Element, pad: number, options: { label?: string; glide?: boolean } = {}) {
    if (!node) return
    const rect = element.getBoundingClientRect()
    const visible = node.dataset.visible === 'true'
    // The first appearance lands in place. Only a move between two elements glides.
    const glide = Boolean(options.glide) && visible
    const to = [
      Math.round(rect.left + window.scrollX - pad),
      Math.round(rect.top + window.scrollY - pad),
      Math.round(rect.width + pad * 2),
      Math.round(rect.height + pad * 2),
    ]
    if (node === this.box && this.glide) {
      // The selection's outline rides a spring. It is one empty box with nothing inside to lay out, so its size can travel too.
      if (glide) this.glide.to(to)
      else this.glide.set(to)
    } else {
      node.dataset.glide = String(glide)
      node.style.transform = `translate(${to[0]}px, ${to[1]}px)`
      node.style.width = `${to[2]}px`
      node.style.height = `${to[3]}px`
    }
    if (options.label !== undefined && this.boxLabel && node === this.box) {
      this.boxLabel.textContent = options.label
      node.dataset.labelBelow = String(rect.top - 36 < this.headerBottom())
    }
    node.dataset.visible = 'true'
  }

  private hide(node: HTMLElement | undefined) {
    if (node) node.dataset.visible = 'false'
  }

  private reposition = () => {
    if (this.target?.isConnected && this.state.inspecting) {
      this.place(this.box, this.target, 6, { label: this.state.selection?.label })
    }
    this.hide(this.hoverBox)
    if (this.state.lit) this.placeGhosts()
  }

  // Blast radius

  showUsers = (path: string, options: { announce?: boolean } = {}) => {
    this.wanted = path
    const engine = this.engine
    const scope = this.scope()
    if (!engine) {
      void this.load().then(() => {
        if (this.wanted === path) this.showUsers(path, options)
      })
      return
    }
    if (!scope || !this.ghosts) return
    // Finding a token's elements means probing the page. A token that is already lit has been found.
    if (this.state.lit?.path !== path || !this.litUsers.length) {
      this.litUsers = engine.usersOf(path, this.selection(), scope)
      this.placeGhosts({ stagger: true })
    }
    const count = this.litUsers.length
    if (this.state.lit?.path !== path || this.state.lit.count !== count) this.set({ lit: { path, count } })
    if (options.announce) this.announce(`${count} ${count === 1 ? 'element' : 'elements'} on this page ${count === 1 ? 'uses' : 'use'} ${path}.`)
  }

  /** Draws an outline on each element the lit token paints, from the list already found. */
  private placeGhosts(options: { stagger?: boolean } = {}) {
    if (!this.ghosts) return
    const users = this.litUsers
    const stagger = options.stagger ? durationMs('--semantic-duration-causal') / 2 : 0
    while (this.ghosts.children.length < users.length) this.ghosts.append(document.createElement('div'))
    // An outline marks where an element belongs. One that hangs crooked is measured as if it hung straight.
    const hung = users.filter((element): element is HTMLElement | SVGElement => this.unhooked.has(element as HTMLElement))
    for (const element of hung) element.style.rotate = '0deg'
    // Measure everything, then move everything, so the page is laid out once.
    const rects = users.map((element) => (element.isConnected ? element.getBoundingClientRect() : null))
    for (const element of hung) element.style.removeProperty('rotate')
    ;[...this.ghosts.children].forEach((node, i) => {
      const ghost = node as HTMLElement
      const rect = rects[i]
      if (!rect?.width) {
        ghost.dataset.visible = 'false'
        return
      }
      ghost.style.width = `${Math.round(rect.width + 8)}px`
      ghost.style.height = `${Math.round(rect.height + 8)}px`
      ghost.style.transform = `translate(${Math.round(rect.left + window.scrollX - 4)}px, ${Math.round(rect.top + window.scrollY - 4)}px)`
      ghost.style.transitionDelay = `${Math.min(i, 24) * stagger}ms`
      ghost.dataset.visible = 'true'
    })
  }

  clearUsers = () => {
    this.wanted = null
    // While a rule is broken and nothing is being inspected, the outlines of what it left behind stay up.
    if (this.state.broken && !this.state.inspecting && this.slot && this.slotRatio > 0) {
      this.lightBroken()
      return
    }
    this.clearGhosts()
    if (this.state.lit) this.set({ lit: null })
  }

  private clearGhosts() {
    this.litUsers = []
    for (const node of this.ghosts?.children ?? []) {
      const ghost = node as HTMLElement
      ghost.style.transitionDelay = '0ms'
      ghost.dataset.visible = 'false'
    }
  }

  private lightBroken() {
    const path = this.state.check.findings[0]?.path
    if (!path) return
    this.showUsers(path)
    this.unhook()
  }

  /**
   * Lets what the broken token paints hang crooked. Each element keeps its place and tilts from a top corner,
   * so its outline shows where the system still expects it. The swing itself is CSS in globals.css.
   */
  private unhook() {
    this.litUsers.forEach((element, i) => {
      if (!(element instanceof HTMLElement || element instanceof SVGElement) || this.unhooked.has(element)) return
      const { width } = element.getBoundingClientRect()
      if (!width) return
      // Narrow things tilt further than wide ones, so everything droops by about the same distance.
      const tilt = (i % 2 ? 1 : -1) * Math.min(8, Math.max(1.5, 220 / width))
      element.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`)
      element.style.setProperty('--hook', i % 2 ? '100% 0' : '0 0')
      element.style.setProperty('--unhook-order', String(Math.min(i, 16)))
      element.setAttribute('data-unhooked', '')
      this.unhooked.add(element)
    })
  }

  /** Swings everything that hangs back into place. */
  private rehook() {
    for (const element of this.unhooked) {
      if (element.isConnected) element.setAttribute('data-unhooked', 'back')
      else this.unhooked.delete(element)
    }
  }

  private release(element: HTMLElement | SVGElement) {
    element.removeAttribute('data-unhooked')
    for (const property of ['--tilt', '--hook', '--unhook-order']) element.style.removeProperty(property)
    this.unhooked.delete(element)
  }

  /**
   * While a rule is broken and nobody is inspecting, the outlines of what it left behind stay up
   * only where a dock is there to explain them and to restore the rule.
   */
  private syncBroken() {
    if (!this.state.broken || this.state.inspecting) return
    if (this.slot && this.slotRatio > 0) this.lightBroken()
    else {
      this.clearGhosts()
      if (this.state.lit) this.set({ lit: null })
    }
  }

  // Break a rule

  setBroken = async (broken: boolean) => {
    this.endIntro()
    const engine = await this.load()
    engine.setBroken(broken)
    // The graph changed, so what a token paints has to be found again.
    this.clearGhosts()
    const check = engine.check()
    const finding = check.findings[0]
    // What the token pointed at while the graph was still whole: the last step of its chain as built.
    const built = finding ? (engine.builtChain(finding.path, this.selection())?.steps ?? []) : []
    const severed = built.length > 1 ? built[built.length - 1].path : null
    this.set({
      broken,
      check,
      brokenChain: finding ? engine.chain(finding.path, this.selection()) : null,
      severed,
      severedChain: severed ? engine.chain(severed, this.selection()) : null,
    })
    // The page itself knows a rule is broken, so anything drawn over it can step aside and let the result show.
    document.documentElement.toggleAttribute('data-rule-broken', broken)
    this.snapped = broken
    if (!broken) this.rehook()
    this.strand(engine)
    if (this.state.inspecting && this.target) this.select(this.target, { force: true, animate: true })
    else if (broken) this.lightBroken()
    else {
      this.clearGhosts()
      this.set({ lit: null })
    }
    this.announce(
      finding
        ? `Rule broken. Build stopped, exit 1. ${finding.ruleId} on ${finding.path}. No color changed. What that token paints now hangs loose.`
        : 'Rule restored. Build passed, exit 0.',
    )
  }

  toggleBroken = () => this.setBroken(!this.state.broken)

  /**
   * True once for each time the rule is broken. The dock asks before it plays the break, so the moment
   * belongs to the press that caused it and never replays when the same state is simply shown again.
   */
  takeSnap = () => {
    const snapped = this.snapped
    this.snapped = false
    return snapped
  }

  // Rebrand

  /** Retunes the accent to a hue. The page follows at once. What a broken rule froze does not. */
  setBrand = (hue: number) => {
    this.endIntro()
    this.wantedHue = hue
    const engine = this.engine
    if (!engine) {
      // Show the control moving now. The color arrives with the engine.
      this.set({ brand: { ...this.state.brand, hue } })
      void this.load().then(() => this.setBrand(this.wantedHue))
      return
    }
    this.set({ brand: engine.setBrand(hue) })
    this.strand(engine)
    // The dock's chains are read from the graph, which is rebuilt per hue. Once a frame is as often as anyone can read them.
    this.brandFrame ||= requestAnimationFrame(() => {
      this.brandFrame = 0
      if (this.state.inspecting && this.target) this.select(this.target, { force: true, refresh: true })
    })
  }

  /** Notes whether the rebrand has left the broken token behind, and shows on the page where it should have landed. */
  private strand(engine: Engine) {
    const stranded = engine.stranded(this.selection())
    const was = this.state.stranded
    if (stranded?.held !== was?.held || stranded?.now !== was?.now) {
      const { severed } = this.state
      this.set({ stranded, severedChain: severed ? engine.chain(severed, this.selection()) : null })
    }
    const overlay = this.surfaces?.overlay
    if (overlay) {
      if (stranded) overlay.style.setProperty('--stranded', stranded.now)
      else overlay.style.removeProperty('--stranded')
      overlay.toggleAttribute('data-stranded', Boolean(stranded))
    }
    if (stranded && !was) {
      const count = this.state.lit?.count
      this.announce(
        `The rebrand did not land. ${count ? `${count} ${count === 1 ? 'element still paints' : 'elements still paint'}` : 'What the broken token paints still holds'} ${stranded.held}.`,
      )
    }
  }

  resetBrand = () => this.setBrand(this.brand.built.hue)

  // Motion

  private applyMotion(motion: Motion) {
    document.documentElement.dataset.motion = motion
    this.set({ motion })
    if (this.state.inspecting && this.target && this.engine) this.select(this.target, { force: true, animate: false })
  }

  setMotion = (motion: Motion) => {
    // Only the choice between default and reduced is kept, and only when it differs from the system setting.
    // Slow motion is for looking at something now. It ends with the visit.
    const system: Motion = prefersReducedMotion() ? 'reduced' : 'default'
    try {
      if (motion === 'slow') {
        // Nothing is stored and nothing stored is touched: a visitor who chose reduced motion gets it back next visit.
      } else if (motion === system) localStorage.removeItem(MOTION_KEY)
      else localStorage.setItem(MOTION_KEY, motion)
    } catch {
      // Storage can be unavailable. The choice still holds for this visit.
    }
    this.applyMotion(motion)
    this.announce(
      motion === 'reduced'
        ? 'Reduced motion on. Every duration token now routes to 0 milliseconds.'
        : motion === 'slow'
          ? 'Slow motion on. Every duration token now runs at a quarter of its speed.'
          : 'Default motion restored.',
    )
  }

  // The floating dock

  private updateFloating() {
    const narrow = window.matchMedia(NARROW).matches
    let floating = this.state.floating
    if (!this.state.inspecting) floating = false
    else if (!this.slot || narrow) floating = true
    // Leave below 35% visible and come home above 65%, so it never flickers at the edge.
    else if (!floating && this.slotRatio < 0.35) floating = true
    else if (floating && this.slotRatio > 0.65) floating = false
    if (floating === this.state.floating) return
    const from = document.querySelector<HTMLElement>(floating ? '[data-inspector-dock="inline"]' : '[data-inspector-dock="floating"]')
    this.handoff = from?.getClientRects().length ? from.getBoundingClientRect() : null
    // Both docks hold the same controls only while inspecting. When inspecting ends, focus is placed by what ended it.
    this.focusIndex = from && this.state.inspecting ? [...from.querySelectorAll(FOCUSABLE)].indexOf(document.activeElement as Element) : -1
    const apply = () => {
      if (floating) document.documentElement.dataset.inspectorFloating = ''
      else delete document.documentElement.dataset.inspectorFloating
      this.set({ floating, side: 'right' })
    }
    // With no dock in view to hand over to, the floating one leaves on its own: quicker and quieter than it arrived.
    const duration = durationMs('--semantic-duration-feedback')
    const home = this.slot && this.slotRatio > 0 && !narrow
    if (!floating && from && !home && duration) {
      this.handoff = null
      const leaving = from.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(8px)' }], {
        duration,
        easing: easing(),
        fill: 'forwards',
      })
      leaving.finished.then(
        () => {
          // The visitor may have started inspecting again while it left.
          if (this.state.inspecting) leaving.cancel()
          else apply()
        },
        () => undefined,
      )
      return
    }
    apply()
  }

  /** Sends the floating dock to the other side of the screen. The button for it, and the way to do it without dragging. */
  crossOver = () => {
    const dock = document.querySelector<HTMLElement>(FLOATING_DOCK)
    if (dock) this.handoff = dock.getBoundingClientRect()
    this.set({ side: this.state.side === 'right' ? 'left' : 'right' })
  }

  /**
   * Lets a pointer pick the floating dock up by its header and throw it. It follows the pointer sideways,
   * resists up and down, and when let go it lands on whichever side the throw was heading for, on a spring
   * that starts at the speed it was thrown.
   */
  grab = (event: PointerEvent, dock: HTMLElement) => {
    if (dock.dataset.inspectorDock !== 'floating' || window.matchMedia(NARROW).matches || event.button !== 0) return
    const from = event.target
    // Only the header is a handle, and the controls in it keep their own presses.
    if (!(from instanceof Element) || !from.closest('[data-dock-handle]') || from.closest(FOCUSABLE)) return
    const start = { x: event.clientX, y: event.clientY }
    const trail: { time: number; x: number }[] = []
    const spring = createSpring(
      ([x, y]) => {
        dock.style.translate = x || y ? `${x}px ${y}px` : ''
      },
      () => durationMs('--component-dock-motion'),
      numberToken('--spring-land'),
    )
    let dragging = false
    // The dock keeps the pointer from the press on, so a fast throw that leaves its edges is still its own.
    dock.setPointerCapture(event.pointerId)

    const move = (moved: PointerEvent) => {
      const x = moved.clientX - start.x
      const y = moved.clientY - start.y
      // A press that barely moves is a click on the header, not a drag.
      if (!dragging && Math.hypot(x, y) < 4) return
      if (!dragging) {
        dragging = true
        dock.dataset.dragging = ''
      }
      trail.push({ time: moved.timeStamp, x: moved.clientX })
      if (trail.length > 5) trail.shift()
      spring.set([x, y / 4])
    }

    const release = () => {
      dock.removeEventListener('pointermove', move)
      dock.removeEventListener('pointerup', release)
      dock.removeEventListener('pointercancel', release)
      if (!dragging) return
      delete dock.dataset.dragging
      // raw: long enough for the browser to report what the pointer came to rest on. Input timing, not motion, so reduced motion must not zero it.
      this.dropped = performance.now() + 120
      // Its speed over the last few moves, in pixels a second.
      const first = trail[0]
      const last = trail[trail.length - 1]
      const velocity = last && last.time > first.time ? ((last.x - first.x) / (last.time - first.time)) * 1000 : 0
      const rect = dock.getBoundingClientRect()
      // Where it was heading: its middle, carried a fifth of a second further at that speed.
      const heading = rect.left + rect.width / 2 + velocity * 0.2
      const side = heading < window.innerWidth / 2 ? 'left' : 'right'
      if (side === this.state.side) {
        spring.to([0, 0], [velocity, 0])
        return
      }
      this.thrown = { from: rect, velocity, spring }
      this.set({ side })
    }

    dock.addEventListener('pointermove', move)
    dock.addEventListener('pointerup', release)
    dock.addEventListener('pointercancel', release)
  }

  /** Moves a dock from where the other one was to where it now sits, and keyboard focus with it. */
  playHandoff(dock: HTMLElement) {
    // A dock that was thrown lands on its spring: from where it was let go, at the speed it had.
    if (this.thrown) {
      const { from, velocity, spring } = this.thrown
      this.thrown = null
      spring.set([0, 0])
      const home = dock.getBoundingClientRect()
      spring.set([from.left - home.left, from.top - home.top])
      spring.to([0, 0], [velocity, 0])
      return
    }
    // Both docks hold the same controls in the same order, so the same position is the same control.
    const focus = this.focusIndex >= 0 ? dock.querySelectorAll<HTMLElement>(FOCUSABLE)[this.focusIndex] : null
    this.focusIndex = -1
    focus?.focus({ preventScroll: true })
    // A sheet can't cross over. While it is up the page has room beneath it, so what has focus scrolls clear of it.
    const focused = document.activeElement
    if (window.matchMedia(NARROW).matches && focused instanceof HTMLElement && focused !== document.body && !focused.closest(FLOATING_DOCK)) {
      focused.scrollIntoView({ block: 'nearest' })
    }
    // Arriving on top of what has focus is no arrival. The dock crosses over first and this runs again from there.
    if (this.makeWayFor(document.activeElement, { arriving: true })) return
    const first = this.handoff
    this.handoff = null
    const duration = durationMs('--component-dock-motion')
    const last = dock.getBoundingClientRect()
    if (!duration || !last.width) return
    if (!first) {
      dock.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }], {
        duration: durationMs('--semantic-duration-reveal'),
        easing: easing(),
      })
      return
    }
    // Transform only: the dock travels, and nothing on the page is laid out again while it does.
    dock.animate(
      [{ transform: `translate(${first.left - last.left}px, ${first.top - last.top}px)` }, { transform: 'translate(0, 0)' }],
      { duration, easing: easing() },
    )
  }
}

/** Resolves once the frame holding the changes made so far has been painted. */
function painted(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 0))
  })
}

/** How much of `rect` lies under `cover`, from 0 to 1. */
function covered(rect: DOMRect, cover: DOMRect): number {
  const width = Math.min(rect.right, cover.right) - Math.max(rect.left, cover.left)
  const height = Math.min(rect.bottom, cover.bottom) - Math.max(rect.top, cover.top)
  const area = rect.width * rect.height
  return area > 0 && width > 0 && height > 0 ? (width * height) / area : 0
}

function prefersReducedMotionContext() {
  return document.documentElement.dataset.motion === 'reduced'
}

/** What a screen reader hears for a selection: its name and how much of it the tokens explain. The rows are in the dock. */
function summarize(selection: Inspection) {
  const traced = selection.properties.filter((property) => property.chains.length).length
  const raw = selection.properties.length - traced
  const broken = selection.properties.some((property) => property.chains.some((chain) => chain.steps.some((step) => step.finding)))
  const parts = [`${selection.label}.`]
  if (traced) parts.push(`${traced} ${traced === 1 ? 'property comes' : 'properties come'} from tokens.`)
  if (raw) parts.push(`${raw} ${raw === 1 ? 'is a raw value' : 'are raw values'}.`)
  if (!traced && !raw) parts.push('No token paints it directly.')
  if (broken) parts.push('One chain is broken.')
  return parts.join(' ')
}
