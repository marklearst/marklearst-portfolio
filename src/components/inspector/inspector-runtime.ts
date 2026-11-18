import type { Engine } from '@/lib/inspector/engine'
import { durationMs, easing, numberToken } from '@/lib/motion-tokens'
import { createSpring, type Spring } from '@/lib/spring'
import type { ContextSelection, Inspection } from '@/lib/inspector/types'
import { loadFloatingInspector } from './load-floating-inspector'
import { loadInspectorDetails } from './load-inspector-details'

import type { InspectorConfig, InspectorState, InspectorStore, InspectorSurfaces } from './inspector-controller'

const SCOPE = '#page-content'
const UI = '[data-inspector-ui]'
/** Controls a browser focuses on its own. */
const CONTROLS = 'a[href], button, input, select, textarea, summary'
const NATIVE_FOCUS = `${CONTROLS}, [tabindex]`
/** Content that gets a tab stop while inspecting, so the keyboard reaches what a pointer can. */
const TAB_STOPS = 'section[aria-labelledby], article[aria-labelledby], h1, h2, h3, h4, h5, h6, p, li, img, blockquote, pre, dt, dd, th, td, figcaption, svg[role="img"][data-inspect]'
const WRAPPERS = new Set(['span', 'strong', 'em', 'b', 'i', 'small', 'mark', 'br', 'wbr'])
/** What a dock holds that can take focus, in the order both docks render it. */
const FOCUSABLE = 'button, a[href], input'
const DOCK = '[data-inspector-dock]:not([data-away])'
const FLOATING_DOCK = '[data-inspector-dock="floating"]'
const NARROW = '(max-width: 959px)'
export class InspectorRuntime {
  private store: InspectorStore
  private get state() { return this.store.getState() }
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
  private hoverTimer = 0
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
  private panelReady = false
  /** Invalidates an activation if Inspect is cancelled or opened again during loading. */
  private activation = 0
  private lastSelect = -Infinity
  private returnFocus: HTMLElement | null = null
  private handoff: DOMRect | null = null
  /** The control that should retain focus when one dock hands over to the other. */
  private focusKey: string | null = null
  private wanted: string | null = null
  private wantedHue = 0
  private brandFrame = 0
  private pendingBrand = false
  private detach: (() => void) | undefined

  readonly reveal: InspectorConfig['reveal']
  readonly brand: InspectorConfig['brand']

  constructor({ reveal, brand }: InspectorConfig, store: InspectorStore) {
    this.reveal = reveal
    this.brand = brand
    this.store = store
  }

  private set(patch: Partial<InspectorState>) { this.store.set(patch) }

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

    const narrow = window.matchMedia(NARROW)
    const onNarrow = () => this.updateFloating()
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
    window.addEventListener('resize', this.reposition, { signal })
    window.addEventListener('scroll', this.onScroll, { passive: true, signal })
    this.resizeObserver = new ResizeObserver(this.reposition)
    this.resizeObserver.observe(document.body)

    this.detach = () => {
      controller.abort()
      narrow.removeEventListener('change', onNarrow)
      this.resizeObserver?.disconnect()
      this.slotObserver?.disconnect()
      clearTimeout(this.hoverTimer)
      cancelAnimationFrame(this.frame)
      cancelAnimationFrame(this.brandFrame)
      clearTimeout(this.pointerTimer)
      this.glide?.stop()
      surfaces.overlay.replaceChildren()
    }
  }

  destroy() {
    this.activation += 1
    this.ticket += 1
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
    clearTimeout(this.hoverTimer)
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
    if (this.state.loadStatus !== 'idle') return
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
      this.set({ brand: this.engine.setBrand(this.state.brand.hue) })
      return this.engine
    }).catch((error) => {
      this.loading = undefined
      throw error
    })
    return this.loading
  }

  /** Starts loading the engine and, once the browser is idle, has it read the stylesheets, so the first real interaction waits for neither. */
  warm = () => {
    if (this.warmed) return
    this.warmed = true
    void Promise.all([this.load(), this.loadPanel()]).then(([engine]) => {
      const whenIdle = window.requestIdleCallback ?? ((work: () => void) => window.setTimeout(work, 0))
      whenIdle(() => engine.prepare())
    }).catch(() => { this.warmed = false })
  }

  private async loadPanel() {
    await Promise.all([loadFloatingInspector(), loadInspectorDetails()])
    this.panelReady = true
  }

  private selection(): ContextSelection {
    const root = document.documentElement
    return {
      theme: root.dataset.theme === 'light' ? 'light' : 'dark',
      motion: root.dataset.motion === 'reduced' ? 'reduced' : root.dataset.motion === 'slow' ? 'slow' : 'default',
    }
  }

  traceTokens = async (path: string) => {
    const engine = await this.load()
    return engine.trace(path, this.selection())
  }

  private announce(message: string) {
    if (this.surfaces) this.surfaces.live.textContent = message
  }

  // Inspect

  setInspecting = async (on: boolean, options: { returnFocus?: HTMLElement | null } = {}) => {
    if (on === this.state.inspecting) return
    return this.resumeInspecting(on, options)
  }

  /** Continues an activation whose initial download and feedback were owned by the controller. */
  resumeInspecting = async (on: boolean, options: { returnFocus?: HTMLElement | null } = {}) => {
    const activation = ++this.activation
    if (on) {
      this.endIntro()
      this.returnFocus = options.returnFocus ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
      document.documentElement.dataset.inspecting = ''
      this.clearGhosts()
      this.set({ inspecting: true, loadStatus: 'loading', pinned: false, lit: null })
      this.announce('Loading inspector. Escape cancels.')
      try {
        await Promise.all([this.load(), this.loadPanel()])
      } catch {
        if (activation !== this.activation) return
        await this.setInspecting(false)
        this.set({ loadStatus: 'error' })
        this.announce('The inspector could not load. Use Inspect to try again.')
        return
      }
      if (activation !== this.activation) return
      this.set({ loadStatus: 'idle' })
      // Hand over only once the panel can mount, keeping the inline dock and its focus intact while loading.
      this.updateFloating()
      // The mode change paints before the page is read, so the control that started it answers at once.
      await painted()
      if (activation !== this.activation) return
      this.setTabStops(true)
      const preview = this.scope()?.querySelector('[data-inspect-preview]')
      const first = preview && this.inView(preview) ? preview : this.firstInView()
      if (first) this.select(first, { animate: true })
      this.announce('Inspect on. Point to an element or tab to it to read its token chain. Enter opens all properties. Escape stops inspecting.')
    } else {
      // A link or button on the page keeps focus through this. Content that only took focus for inspecting can't.
      const active = document.activeElement
      const kept = active instanceof HTMLElement && active.matches(CONTROLS) && this.inScope(active) ? active : null
      clearTimeout(this.hoverTimer)
      delete document.documentElement.dataset.inspecting
      this.setTabStops(false)
      this.ticket += 1
      this.target = null
      this.hide(this.box)
      this.hide(this.hoverBox)
      this.clearGhosts()
      this.set({ inspecting: false, loadStatus: 'idle', pinned: false, selection: null, lit: null, side: 'right' })
      this.focusKey = null
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
  inspectedElement = () => this.target

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
      if (reading) requestAnimationFrame(() => this.keepReading())
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
    const stops = [...scope.querySelectorAll<HTMLElement | SVGElement>(TAB_STOPS)].filter((element) => this.worthAStop(element))
    for (const element of stops) {
      element.setAttribute('tabindex', '0')
      element.setAttribute('data-inspect-tab', '')
    }
  }

  /** Content gets a stop when a person could see it and nothing around it already takes focus. */
  private worthAStop(element: HTMLElement | SVGElement) {
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
    clearTimeout(this.hoverTimer)
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
    if (element === this.target) {
      this.hide(this.hoverBox)
      return
    }
    // Outline immediately. Let the pointer cross the gutter into the reading
    // card without selecting every ancestor it crosses on the way in.
    this.place(this.hoverBox, element, 4, { glide: true })
    this.hoverTimer = window.setTimeout(() => {
      if (this.state.inspecting && !this.state.pinned && element.isConnected) this.select(element)
    }, 100) // raw: pointer intent, independent of playback speed or reduced motion.
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
    clearTimeout(this.hoverTimer)
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
      if (this.state.loadStatus === 'loading') {
        void this.setInspecting(false)
        return
      }
      // From the dock, Escape steps back to the element it describes. From the page, it stops inspecting.
      const target = this.target
      if (active?.closest(DOCK) && (target instanceof HTMLElement || target instanceof SVGElement) && target.isConnected && target.matches(NATIVE_FOCUS)) {
        target.focus()
        return
      }
      void this.setInspecting(false)
      return
    }
    // Enter on the selected element steps into the dock, to the first token that paints it.
    if (event.key === 'Enter' && active === this.target && this.inScope(active) && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const dock = document.querySelector(DOCK)
      const trace = dock?.querySelector<HTMLButtonElement>('[data-trace-details]')
      if (trace) {
        event.preventDefault()
        trace.click()
        return
      }
      const first = dock?.querySelector<HTMLElement>('[data-token-row]') ?? dock?.querySelector<HTMLElement>(FOCUSABLE)
      if (!first) return
      event.preventDefault()
      first.focus()
    }
  }

  // The intro is over when the hero's X-ray has finished its scan, which is the last thing in it to finish.
  // Leaving the attribute up would replay the intro each time the hero or the dock's preview came back.
  private onAnimationEnd = (event: AnimationEvent) => {
    const element = event.target
    if (!(element instanceof HTMLElement || element instanceof SVGElement) || !this.unhooked.has(element)) return
    // The swing is over. From here it just hangs, with no animation holding it.
    if (event.animationName === 'unhook') element.setAttribute('data-unhooked', 'hung')
    else if (event.animationName === 'rehook') this.release(element)
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
      }).catch(() => {
        if (this.wanted === path && options.announce) this.announce('The live token engine could not load. Select the token to try again.')
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
    if (broken === this.state.broken || this.state.ruleStatus === 'loading') return
    return this.resumeBroken(broken)
  }

  resumeBroken = async (broken: boolean) => {
    this.endIntro()
    this.set({ ruleStatus: 'loading' })
    let engine: Engine
    try {
      engine = (await Promise.all([this.load(), loadInspectorDetails()]))[0]
    } catch {
      this.set({ ruleStatus: 'error' })
      this.announce('The rule demo could not load. Try again.')
      return
    }
    engine.setBroken(broken)
    // The graph changed, so what a token paints has to be found again.
    this.clearGhosts()
    const check = engine.check()
    const finding = check.findings[0]
    // What the token pointed at while the graph was still whole: the last step of its chain as built.
    const built = finding ? (engine.builtChain(finding.path, this.selection())?.steps ?? []) : []
    const severed = built.length > 1 ? built[built.length - 1].path : null
    // The visitor can enter the preview while its replacement downloads. Move only
    // focus that would disappear with that body; the dock's rule button survives.
    const active = document.activeElement
    const body = active instanceof Element ? active.closest('[data-inspector-body]') : null
    if (body && !body.querySelector('[data-dock-focus="rule"]')) {
      body.closest(DOCK)?.querySelector<HTMLElement>('[data-dock-focus="rule"]')?.focus({ preventScroll: true })
    }
    this.set({
      broken,
      ruleStatus: 'idle',
      check,
      brokenChain: finding ? engine.chain(finding.path, this.selection()) : null,
      severed,
      severedChain: severed ? engine.chain(severed, this.selection()) : null,
      brandPreview: this.readBrandPreview(engine),
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
    this.set({ brand: { ...this.state.brand, hue } })
    const engine = this.engine
    if (!engine) {
      // Show the control moving now. The color arrives with the engine.
      if (!this.pendingBrand) {
        this.pendingBrand = true
        void this.load().then(() => {
          this.pendingBrand = false
          this.setBrand(this.wantedHue)
        }, () => {
          this.pendingBrand = false
          this.set({ brand: this.brand.built })
          this.announce('The live token engine could not load. Try changing the accent again.')
        })
      }
      return
    }
    // A drag can send several inputs per frame. The page and its chain resolve the latest one together.
    this.brandFrame ||= requestAnimationFrame(() => {
      this.brandFrame = 0
      const brand = engine.setBrand(this.wantedHue)
      this.set({ brand, brandPreview: this.readBrandPreview(engine) })
      this.strand(engine)
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

  private readBrandPreview(engine: Engine) {
    const chain = engine.chain('component.button.accent.background', this.selection())
    const foreground = engine.chain('component.button.accent.text', this.selection())
    if (!chain || !foreground) throw new Error('The accent must resolve in every theme.')
    return { chain, foreground: foreground.value.text }
  }

  resetBrand = () => this.setBrand(this.brand.built.hue)

  /** Re-resolve the same evidence in the new context without moving keyboard focus. */
  themeChanged() {
    const engine = this.engine
    if (!engine) return
    const { lit } = this.state
    const reading = Boolean(document.activeElement?.closest('[data-token-row]'))
    const finding = this.state.check.findings[0]
    const built = finding ? engine.builtChain(finding.path, this.selection())?.steps ?? [] : []
    const severed = built.length > 1 ? built[built.length - 1].path : null
    this.clearGhosts()
    this.set({
      brand: engine.setBrand(this.state.brand.hue),
      brandPreview: this.readBrandPreview(engine),
      brokenChain: finding ? engine.chain(finding.path, this.selection()) : null,
      severed,
      severedChain: severed ? engine.chain(severed, this.selection()) : null,
    })
    this.strand(engine)
    if (this.state.inspecting && this.target) this.select(this.target, { force: true, refresh: true })
    else this.syncBroken()
    if (lit) this.showUsers(lit.path)
    if (reading) requestAnimationFrame(() => {
      this.keepReading()
      // The severed row can keep its DOM focus while its theme-specific token
      // changes. Its highlighted users must follow that new identity too.
      const key = document.activeElement?.getAttribute('data-dock-focus')
      if (key?.startsWith('token:') && this.state.lit?.path !== key.slice(6)) {
        this.showUsers(key.slice(6), { announce: true })
      }
    })
  }

  /** Motion preferences belong to the always available controller; only active inspection needs refreshing. */
  motionChanged() {
    if (this.state.motion === 'reduced') {
      for (const dock of document.querySelectorAll<HTMLElement>('[data-inspector-dock]')) this.stopHandoff(dock)
    }
    if (this.state.inspecting && this.target && this.engine) this.select(this.target, { force: true, animate: false })
  }

  // The floating dock

  private updateFloating() {
    const narrow = window.matchMedia(NARROW).matches
    let floating = this.state.floating
    if (!this.state.inspecting || !this.panelReady || this.state.loadStatus === 'loading') floating = false
    else if (!this.slot || narrow) floating = true
    // Leave below 35% visible and come home above 65%, so it never flickers at the edge.
    else if (!floating && this.slotRatio < 0.35) floating = true
    else if (floating && this.slotRatio > 0.65) floating = false
    if (floating === this.state.floating) return
    const from = document.querySelector<HTMLElement>(floating ? '[data-inspector-dock="inline"]' : '[data-inspector-dock="floating"]')
    this.handoff = from?.getClientRects().length ? from.getBoundingClientRect() : null
    // The floating dock has extra controls and the inline body may hold its preview.
    // Carry the control's identity, never its position among unrelated buttons.
    const active = document.activeElement
    // A quick reversal can happen before the lazy dock mounts. Keep its pending
    // focus identity while the removed control has temporarily left focus on body.
    if (!this.state.inspecting || active !== document.body) {
      this.focusKey = from && this.state.inspecting && active && from.contains(active)
        ? active.getAttribute('data-dock-focus') ?? 'inspect'
        : null
    }
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

  stopHandoff = (dock: HTMLElement) => this.engine?.stopDockMotion(dock)

  /** Moves a dock from where the other one was to where it now sits, and keyboard focus with it. */
  playHandoff(dock: HTMLElement) {
    this.engine?.stopDockMotion(dock)
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
    // If a placement has no equivalent control, its main verb is a predictable destination.
    const focus = this.focusKey
      ? [...dock.querySelectorAll<HTMLElement>('[data-dock-focus]')].find((element) => element.dataset.dockFocus === this.focusKey)
        ?? dock.querySelector<HTMLElement>('[data-dock-verb]')
      : null
    this.focusKey = null
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
    if (!duration || !last.width || !this.engine) return
    if (!first) {
      this.engine.animateDock(dock, { opacity: [0, 1], transform: ['translateY(var(--space-4))', 'translateY(0)'] }, '--semantic-duration-reveal')
      return
    }
    // Transform only: the dock travels, and nothing on the page is laid out again while it does.
    this.engine.animateDock(dock, { transform: [`translate(${first.left - last.left}px, ${first.top - last.top}px)`, 'translate(0, 0)'] }, '--component-dock-motion')
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
