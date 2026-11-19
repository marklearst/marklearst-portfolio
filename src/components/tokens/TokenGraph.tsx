'use client'

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ComponentPropsWithRef } from 'react'
import { animate } from 'motion/mini'
import { Button } from '@/components/ui/Button'
import { ChevronDownIcon } from '@/components/ui/Icon'
import { SPECIMEN_SIZE } from '@/components/home/hero-spec'
import type { TokenPath as SiteTokenPath } from '@/tokens/generated/tokens'
import { InspectorControls, InspectorHueControl } from '@/components/inspector/InspectorDock'
import { useInspector, useInspectorController } from '@/components/inspector/InspectorProvider'
import { durationMs, motionEase } from '@/lib/motion-tokens'
import type { TokenTrace, TraceEdge } from '@/lib/inspector/trace'
import type { ChainValue } from '@/lib/inspector/types'
import { tokenFromHash, tokenHash } from '@/lib/inspector/token-location'
import { tracePropagation } from '@/lib/inspector/trace-propagation'
import { createGraphPropagation } from './graph-propagation'
import TokenPath from './TokenPath'
import styles from './TokenGraph.module.css'

const LAYERS = [
  { id: 'base', name: 'Base', description: 'Raw values' },
  { id: 'meaning', name: 'Meaning', description: 'Shared decisions' },
  { id: 'component', name: 'Component', description: 'Interface roles' },
] as const

const SITE_EXAMPLES: ReadonlyMap<string, string> = new Map([
  ['semantic.color.accent.primary', 'Blueprint accent'],
  [SPECIMEN_SIZE, 'Homepage headline size'],
  ['semantic.type.specimen.tracking', 'Headline letter spacing'],
  ['radius.4', 'Blueprint corners'],
  ['semantic.color.accent.text', 'Wordmark braces'],
  ['semantic.font.body', 'Reading typeface'],
  ['component.button.accent.background', 'Accent button fill'],
  ['component.button.motion', 'Button hover'],
  ['component.inspector.outline', 'Inspector outline'],
  ['component.dock.background', 'Inspector dock background'],
] satisfies [SiteTokenPath, string][])

interface TokenGraphProps {
  initial: Record<'dark' | 'light', TokenTrace>
  catalog: Record<string, readonly string[]>
  accent: Record<'dark' | 'light', ChainValue>
  /** The dedicated system page exposes its selected trace in the URL. Embedded graphs keep local state. */
  linkable?: boolean
}

type DrawnEdge = TraceEdge & { d: string; step: number }

const LOCATION_CHANGED = 'token-trace-location'
const readHash = () => window.location.hash
const serverHash = () => ''
const ignoreLocation = () => () => {}
function subscribeLocation(notify: () => void) {
  window.addEventListener('hashchange', notify)
  window.addEventListener('popstate', notify)
  window.addEventListener(LOCATION_CHANGED, notify)
  return () => {
    window.removeEventListener('hashchange', notify)
    window.removeEventListener('popstate', notify)
    window.removeEventListener(LOCATION_CHANGED, notify)
  }
}

/** Built evidence stays readable in the effective CSS context before hydration. */
function InitialStage({ trace }: { trace: TokenTrace }) {
  return (
    <div className={styles.stage}>
      {LAYERS.map((layer) => (
        <div key={layer.id} className={styles.column}>
          <div className={styles.layerHeading}><h3>{layer.name}</h3><p>{layer.description}</p></div>
          <div className={styles.nodes}>
            {trace.nodes.filter((node) => node.layer === layer.id).map((node) => (
              <div key={node.path} className={styles.node} data-static='' data-selected={node.path === trace.focus || undefined}>
                <code><TokenPath path={node.path} /></code>
                <span className={styles.value}>
                  {node.value.kind === 'color' && node.variable && <span className={styles.swatch} aria-hidden='true' style={{ background: `var(${node.variable})` }} />}
                  <code>{node.value.text}</code>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TraceSummary({ trace }: { trace: TokenTrace }) {
  return <>{trace.nodes.length} tokens and {trace.edges.filter((edge) => !edge.broken).length} references. {trace.dependents} {trace.dependents === 1 ? 'alias follows' : 'aliases follow'} this token.</>
}

function Picker({ label, ...props }: ComponentPropsWithRef<'select'> & { label: string }) {
  const id = useId()
  return <div className={styles.field}>
    <label htmlFor={id}>{label}</label>
    <div className={styles.picker}>
      <select id={id} {...props} />
      <ChevronDownIcon size={16} className={styles.pickerArrow} />
    </div>
  </div>
}

export default function TokenGraph({ initial, catalog, accent, linkable = false }: TokenGraphProps) {
  const controller = useInspectorController()
  const contextReady = useInspector((state) => state.contextReady)
  const theme = useInspector((state) => state.theme)
  const motion = useInspector((state) => state.motion)
  const keyboard = useInspector((state) => state.keyboard)
  const broken = useInspector((state) => state.broken)
  const revision = useInspector((state) => state.brandPreview)
  const original = useInspector((state) => state.brand.hue === controller.brand.built.hue)
  const [localFocus, setFocus] = useState(initial.dark.focus)
  const [browseByLayer, setBrowseByLayer] = useState(false)
  const paths = useMemo(() => Object.values(catalog).flat(), [catalog])
  const hash = useSyncExternalStore(linkable ? subscribeLocation : ignoreLocation, linkable ? readHash : serverHash, serverHash)
  const focus = (linkable && tokenFromHash(hash, paths)) || localFocus
  const [active, setActive] = useState(initial.dark.focus)
  const [attempt, setAttempt] = useState(0)
  const request = useMemo(() => ({ focus, theme, motion, broken, revision, attempt }), [focus, theme, motion, broken, revision, attempt])
  const [result, setResult] = useState<{ request: typeof request | null; trace: TokenTrace; error: boolean }>({ request: null, trace: initial.dark, error: false })
  const pristine = focus === initial[theme].focus && motion === 'default' && !broken && original
  // A pending runtime request must never paint a different theme's values.
  const trace = pristine || result.request?.theme !== theme ? initial[theme] : result.trace
  const error = !pristine && result.error
  const busy = !pristine && request !== result.request
  const activePath = trace.nodes.some((node) => node.path === active) ? active : trace.focus
  const [edges, setEdges] = useState<DrawnEdge[]>([])
  const workbench = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const nodes = useRef(new Map<string, HTMLButtonElement>())
  const drawing = useRef<SVGSVGElement>(null)
  const animateNext = useRef(false)
  const animations = useRef<ReturnType<typeof animate>[]>([])
  const pointer = useRef(false)
  const selectInput = useRef<HTMLSelectElement>(null)
  const retry = useRef<HTMLButtonElement>(null)
  const recoverFocus = useRef(false)
  const detachedFocus = useRef<HTMLButtonElement | null>(null)
  const help = useId()
  const connected = useId()
  const arrival = useRef<string | undefined>(undefined)
  const propagation = useRef<ReturnType<typeof createGraphPropagation> | null>(null)
  const settled = useRef<{ trace: TokenTrace; theme: typeof theme; motion: typeof motion; broken: boolean; focus: string } | null>(null)

  useEffect(() => {
    if (!stage.current) return
    const player = createGraphPropagation(stage.current)
    propagation.current = player
    return () => { player.cancel(); propagation.current = null }
  }, [])

  useEffect(() => {
    const before = settled.current
    const contextChanged = !before || before.theme !== theme || before.motion !== motion || before.broken !== broken || before.focus !== focus
    if (contextChanged || keyboard || motion === 'reduced' || error) propagation.current?.cancel()
    if (!contextReady || busy || error) return
    settled.current = { trace, theme, motion, broken, focus }
    if (contextChanged || keyboard || motion === 'reduced' || before.trace === trace) return
    propagation.current?.play(tracePropagation(before.trace, trace))
  }, [trace, theme, motion, broken, focus, keyboard, error, busy, contextReady])

  useEffect(() => { propagation.current?.cancel() }, [edges])

  useLayoutEffect(() => {
    if (!linkable || !contextReady) return
    // Read the incoming fragment once. A local node choice must never turn
    // into an arrival and move keyboard focus away from that node.
    if (arrival.current === undefined) {
      arrival.current = document.documentElement.dataset.routeNavigation === 'history'
        ? ''
        : tokenFromHash(window.location.hash, paths) ?? ''
    }
    if (!arrival.current || arrival.current !== focus) return
    arrival.current = ''
    selectInput.current?.focus({ preventScroll: true })
    workbench.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [focus, linkable, paths, contextReady])

  useEffect(() => {
    if (pristine) return
    let current = true
    void controller.traceTokens(request.focus).then((next) => {
      if (current) setResult({ request, trace: next, error: false })
    }, () => {
      if (!current) return
      if (stage.current?.contains(document.activeElement)) recoverFocus.current = true
      setResult((previous) => ({ request, trace: previous.trace, error: true }))
    })
    return () => { current = false }
  }, [request, pristine, controller])

  useLayoutEffect(() => {
    if (!recoverFocus.current) return
    if (error) retry.current?.focus()
    else {
      selectInput.current?.focus()
      recoverFocus.current = false
    }
  }, [error])

  useLayoutEffect(() => {
    const previous = detachedFocus.current
    detachedFocus.current = null
    if (previous && !previous.isConnected && document.activeElement === document.body) {
      if (error) retry.current?.focus()
      else selectInput.current?.focus()
    }
  })

  useLayoutEffect(() => {
    const host = stage.current
    if (!host) return
    const measure = () => {
      const bounds = host.getBoundingClientRect()
      const measured = trace.edges.flatMap((edge) => {
        const from = nodes.current.get(edge.from)?.getBoundingClientRect()
        const to = nodes.current.get(edge.to)?.getBoundingClientRect()
        if (!from || !to) return []
        const horizontal = to.left >= from.right
        const x1 = (horizontal ? from.right : from.left + from.width / 2) - bounds.left
        const y1 = (horizontal ? from.top + from.height / 2 : from.bottom) - bounds.top
        const x2 = (horizontal ? to.left : to.left + to.width / 2) - bounds.left
        const y2 = (horizontal ? to.top + to.height / 2 : to.top) - bounds.top
        const x = (x1 + x2) / 2
        const y = (y1 + y2) / 2
        const d = horizontal ? `M${x1},${y1} C${x},${y1} ${x},${y2} ${x2},${y2}` : `M${x1},${y1} C${x1},${y} ${x2},${y} ${x2},${y2}`
        const target = trace.nodes.find((node) => node.path === edge.to)
        return [{ ...edge, d, step: Math.max(0, LAYERS.findIndex((layer) => layer.id === target?.layer) - 1) }]
      })
      setEdges((previous) => previous.length === measured.length && previous.every((edge, index) => {
        const next = measured[index]
        return edge.from === next.from && edge.to === next.to && edge.broken === next.broken && edge.d === next.d && edge.step === next.step
      }) ? previous : measured)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(host)
    for (const node of nodes.current.values()) observer.observe(node)
    return () => observer.disconnect()
  }, [trace])

  useEffect(() => {
    if (!animateNext.current || !drawing.current) return
    animateNext.current = false
    const duration = durationMs('--semantic-duration-reveal') / 1000
    if (!duration) return
    animations.current.forEach((animation) => animation.cancel())
    animations.current = [...drawing.current.querySelectorAll<SVGPathElement>('path[data-reference]:not([data-broken])')].map((path) => animate(path, { strokeDashoffset: [1, 0] }, {
      duration,
      ease: motionEase(),
      delay: Number(path.dataset.step) * durationMs('--semantic-duration-causal') / 1000,
    }))
  }, [edges])

  useEffect(() => {
    if (motion === 'reduced') animations.current.forEach((animation) => animation.cancel())
    return () => animations.current.forEach((animation) => animation.cancel())
  }, [motion])

  const choose = (path: string, animated: boolean) => {
    propagation.current?.cancel()
    animations.current.forEach((animation) => animation.cancel())
    animateNext.current = animated && path !== focus
    setActive(path)
    setFocus(path)
    if (linkable) {
      const url = new URL(window.location.href)
      url.hash = tokenHash(path)
      // Keep Back as a way out of the graph, rather than a history of every node.
      // Next preserves its own history fields and synchronizes the router
      // when the caller does not pass its private navigation markers back.
      window.history.replaceState(null, '', url)
      window.dispatchEvent(new Event(LOCATION_CHANGED))
    }
  }

  const columns = LAYERS.map((layer) => ({ ...layer, nodes: trace.nodes.filter((node) => node.layer === layer.id) }))
  // Keep a deep-linked token selectable even while its trace is loading.
  const tracePaths = new Set([focus, ...(!busy && !error && trace.focus === focus ? trace.nodes.map(node => node.path) : [])])
  const relatedPaths = [...tracePaths].filter(path => !SITE_EXAMPLES.has(path))
  const layer = browseByLayer ? LAYERS.find(({ id }) => catalog[id]?.includes(focus))?.id : undefined

  return (
    <section ref={workbench} id={linkable ? `token=${focus}` : undefined} className={styles.workbench} data-inspector-ui='' aria-label='Live token graph' aria-describedby={help} onPointerDownCapture={() => { pointer.current = true }} onKeyDownCapture={() => { pointer.current = false }}>
      <div className={styles.toolbar}>
        <Picker label='Browse' value={layer ?? 'examples'} disabled={!contextReady} onChange={event => {
          const group = catalog[event.currentTarget.value]
          setBrowseByLayer(Boolean(group))
          if (group?.length && !group.includes(focus)) choose(group[0], pointer.current)
        }}>
          <option value='examples'>On this site</option>
          {LAYERS.map(({ id, name }) => <option key={id} value={id}>{name} ({catalog[id].length})</option>)}
        </Picker>
        <Picker label='Trace a token' ref={selectInput} value={focus} disabled={!contextReady} onPointerEnter={controller.warm} onFocus={controller.warm} onChange={(event) => choose(event.currentTarget.value, pointer.current)}>
          {layer ? catalog[layer].map(path => <option key={path} value={path}>{path}</option>) : <>
            <optgroup label='Site details'>
              {Array.from(SITE_EXAMPLES, ([path, label]) => <option key={path} value={path}>{label}</option>)}
            </optgroup>
            {relatedPaths.length > 0 && <optgroup label='In this trace'>
              {relatedPaths.map(path => <option key={path} value={path}>{path}</option>)}
            </optgroup>}
          </>}
        </Picker>
        <p className={styles.context}>{contextReady ? <>{theme === 'dark' ? 'Dark' : 'Light'} theme with {motion} motion.</> : <>
          <span className={styles.builtDark}>Dark theme.</span>
          <span className={styles.builtLight}>Light theme.</span>
        </>}</p>
      </div>
      <p id={help} className={styles.help}>Choose a detail from the site to see which tokens it uses. Arrow keys move between nodes. Enter traces the selected node.</p>
      <noscript><p className={styles.help}>Interactive tracing requires JavaScript. The diagram shows the built accent chain.</p></noscript>
      {error && <div role='alert' className={styles.help}><p>The live graph could not load.</p><Button ref={retry} variant='secondary' size='sm' onClick={() => {
        recoverFocus.current = true
        setAttempt((value) => value + 1)
      }}>Try again</Button></div>}
      {!contextReady && <>
        <div className={styles.builtDark}><InitialStage trace={initial.dark} /></div>
        <div className={styles.builtLight}><InitialStage trace={initial.light} /></div>
      </>}
      <div ref={stage} className={styles.stage} aria-busy={busy} hidden={error || !contextReady}>
        <svg ref={drawing} className={styles.wires} aria-hidden='true'>
          {edges.map((edge) => <path key={`${edge.from}:${edge.to}`} d={edge.d} pathLength={1} data-reference='' data-broken={edge.broken || undefined} data-step={edge.step} />)}
          {edges.filter(edge => !edge.broken).map(edge => <path key={`propagation:${edge.from}:${edge.to}`} d={edge.d} pathLength={1} data-propagation='' data-from={edge.from} data-to={edge.to} />)}
        </svg>
        {columns.map((column, columnIndex) => (
          <div key={column.id} className={styles.column}>
            <div className={styles.layerHeading}><h3>{column.name}</h3><p>{column.description}</p></div>
            <div className={styles.nodes}>
              {column.nodes.map((node, index) => (
                <button key={node.path} ref={(element) => {
                  if (element) nodes.current.set(node.path, element)
                  else {
                    const previous = nodes.current.get(node.path)
                    if (previous === document.activeElement) detachedFocus.current = previous ?? null
                    nodes.current.delete(node.path)
                  }
                }} type='button' className={styles.node} aria-pressed={focus === node.path} aria-describedby={connected} tabIndex={activePath === node.path ? 0 : -1} data-failed={node.finding ? '' : undefined} data-trace-node={node.path}
                  onFocus={() => setActive(node.path)}
                  onClick={(event) => choose(node.path, event.detail > 0)}
                  onKeyDown={(event) => {
                    let next: string | undefined
                    if (event.key === 'ArrowUp') next = column.nodes[Math.max(0, index - 1)]?.path
                    if (event.key === 'ArrowDown') next = column.nodes[Math.min(column.nodes.length - 1, index + 1)]?.path
                    const adjacent = event.key === 'ArrowLeft' ? columns.slice(0, columnIndex).reverse().find((layer) => layer.nodes.length) : event.key === 'ArrowRight' ? columns.slice(columnIndex + 1).find((layer) => layer.nodes.length) : undefined
                    if (adjacent) next = adjacent.nodes[Math.min(index, adjacent.nodes.length - 1)]?.path
                    if (event.key === 'Home') next = column.nodes[0]?.path
                    if (event.key === 'End') next = column.nodes.at(-1)?.path
                    if (next) { event.preventDefault(); nodes.current.get(next)?.focus() }
                  }}>
                  <code><TokenPath path={node.path} /></code>
                  <span className={styles.value} data-trace-value=''>
                    {node.value.kind === 'color' && node.variable && <span className={styles.swatch} aria-hidden='true' style={{ background: `var(${node.variable})` }} />}
                    <code>{node.value.text}</code>
                  </span>
                  {node.finding && <span className={styles.finding}>Literal. {node.finding.ruleId}.</span>}
                </button>
              ))}
              {!column.nodes.length && <p className={styles.empty}>No {column.name.toLowerCase()} token in this trace.</p>}
            </div>
          </div>
        ))}
      </div>
      <p id={connected} className={styles.summary} aria-live='polite' hidden={error}>{contextReady ? <TraceSummary trace={trace} /> : <>
        <span className={styles.builtDark}><TraceSummary trace={initial.dark} /></span>
        <span className={styles.builtLight}><TraceSummary trace={initial.light} /></span>
      </>}</p>
      <div className={styles.experiment}><InspectorHueControl value={revision?.chain.value ?? accent[theme]} /></div>
      <InspectorControls />
    </section>
  )
}
