'use client'

import { createContext, Fragment, use, useEffect, useId, useLayoutEffect, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { CloseIcon } from '@/components/ui/Icon'
import { Segmented, SegmentedOption } from '@/components/ui/Segmented'
import { Slider } from '@/components/ui/Slider'
import type { Contrast, PropertyReport, ResolvedChain } from '@/lib/inspector/types'
import { durationMs, easing } from '@/lib/motion-tokens'
import type { Preview } from './inspector-controller'
import { useInspector, useInspectorController } from './InspectorProvider'
import styles from './Inspector.module.css'

// The inspector's dock, in parts. Compose the ones a placement needs:
//
//   <InspectorDock placement='inline'>
//     <InspectorStatus />
//     <InspectorBody preview={preview} />
//     <InspectorControls />
//   </InspectorDock>
//
// Every part reads the one inspector in <InspectorProvider>, so two docks on
// a page always agree.

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many)

/** Where each run of rows starts, given how many rows each run holds. Rows resolve in this order. */
function startsOf(sizes: readonly number[]): number[] {
  const starts: number[] = []
  let total = 0
  for (const size of sizes) {
    starts.push(total)
    total += size
  }
  return starts
}

interface InspectorSlotProps {
  /** One or two sentences under the dock that say what it is, the way a caption sits under a figure. */
  caption?: ReactNode
  children: ReactNode
}

/** Reserves the dock's place in the page and tells the inspector when that place scrolls away. */
export function InspectorSlot({ caption, children }: InspectorSlotProps) {
  const controller = useInspectorController()
  const floating = useInspector((state) => state.floating)
  const slot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    controller.registerSlot(slot.current)
    return () => controller.registerSlot(null)
  }, [controller])

  return (
    <div className={styles.figure} data-inspector-ui=''>
      <div ref={slot} className={styles.slot} data-empty={floating || undefined}>
        <p className={styles.placeholder} aria-hidden='true'>The inspector is following you.</p>
        {children}
      </div>
      {caption && <p className={styles.caption}>{caption}</p>}
    </div>
  )
}

interface InspectorDockProps extends ComponentProps<'aside'> {
  /** `inline` sits in the page. `floating` follows the visitor while they inspect. */
  placement: 'inline' | 'floating'
}

export function InspectorDock({ placement, className, style, onPointerEnter, onPointerDown, onFocus, children, ...props }: InspectorDockProps) {
  const controller = useInspectorController()
  const floating = useInspector((state) => state.floating)
  const side = useInspector((state) => (placement === 'floating' ? state.side : 'right'))
  const away = placement === 'inline' && floating
  const dock = useRef<HTMLElement>(null)
  const wasAway = useRef(placement === 'floating')
  const lastSide = useRef(side)

  // One dock hands over to the other: the arriving one starts where the leaving one was.
  // A floating dock that crosses the screen to uncover what has focus travels the same way.
  useLayoutEffect(() => {
    const arrived = wasAway.current && !away
    const crossed = lastSide.current !== side
    wasAway.current = away
    lastSide.current = side
    if ((arrived || crossed) && dock.current) controller.playHandoff(dock.current)
  }, [away, side, controller])

  return (
    <aside
      aria-label='Token inspector'
      {...props}
      ref={dock}
      className={className ? `${styles.dock} ${className}` : styles.dock}
      // The floating dock holds still while the page changes under it. See the view transition rules in globals.css.
      style={placement === 'floating' ? { viewTransitionName: 'inspector-dock', ...style } : style}
      data-inspector-ui=''
      data-inspector-dock={placement}
      data-side={placement === 'floating' ? side : undefined}
      data-away={away || undefined}
      inert={away}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        controller.warm()
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (!event.defaultPrevented) controller.grab(event.nativeEvent, event.currentTarget)
      }}
      onFocus={(event) => {
        onFocus?.(event)
        controller.warm()
      }}
    >
      {/* One fixed heading for the whole dock, so the selection's name isn't a heading that keeps changing its place in the outline. */}
      <h2 className={styles.srOnly}>Token inspector</h2>
      {children}
    </aside>
  )
}

/**
 * A word or two that arrives a letter at a time. Screen readers get the text whole, once.
 * Give it a `key` that changes with the text, and each new text arrives the same way.
 */
function Letters({ text }: { text: string }) {
  return (
    <>
      <span className={styles.srOnly}>{text}</span>
      <span aria-hidden='true' className={styles.letters}>
        {[...text].map((letter, i) => (
          <span key={i} style={{ '--i': i } as CSSProperties}>
            {letter === ' ' ? '\u00a0' : letter}
          </span>
        ))}
      </span>
    </>
  )
}

/** The check, in the build's own words: the command, the verdict, the exit code. */
export function InspectorStatus() {
  const controller = useInspectorController()
  const check = useInspector((state) => state.check)
  const brand = useInspector((state) => state.brand)
  const floating = useInspector((state) => state.floating)
  const side = useInspector((state) => state.side)
  const failed = check.exit !== 0
  const rebranded = brand.hue !== controller.brand.built.hue
  const exit = useRef<HTMLElement>(null)
  const lastExit = useRef(check.exit)
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    if (lastExit.current === check.exit) return
    lastExit.current = check.exit
    setChanged(true)
    const duration = durationMs('--semantic-duration-reveal')
    if (duration) exit.current?.animate([{ scale: 1 }, { scale: 1.12 }, { scale: 1 }], { duration, easing: easing() })
  }, [check.exit])

  return (
    // In the floating dock this is also the handle: it can be picked up here and thrown to the other side.
    <div className={styles.status} data-failed={failed || undefined} data-dock-handle=''>
      <p className={styles.statusLine}>
        <code className={styles.command}>{check.command}</code>
        <strong className={styles.verdict}>
          {/* The verdict is the news here, so when it changes it is spelled out. On first paint it is simply there. */}
          {changed ? <Letters key={String(failed)} text={failed ? 'Build stopped' : 'Build passed'} /> : failed ? 'Build stopped' : 'Build passed'}
        </strong>
        <code ref={exit} className={styles.exit}>exit {check.exit}</code>
      </p>
      <div className={styles.findings} aria-hidden={!failed}>
        <div>
          {check.findings.map((finding) => (
            <p key={finding.ruleId + finding.path} className={styles.findingLine}>
              <code>{finding.ruleId}</code> <code>{finding.path}</code>: {finding.message}
            </p>
          ))}
        </div>
      </div>
      <p className={styles.meta}>
        <span>
          {check.tokens} tokens, {check.layers} layers, {check.contexts} contexts, {check.findings.length}{' '}
          {plural(check.findings.length, 'finding', 'findings')}
        </span>
        {/* Dragging the dock across is one way to move it. This is the other, for a keyboard or a hand that can't drag. */}
        {floating && (
          <button type='button' className={`${styles.textButton} ${styles.cross}`} onClick={controller.crossOver}>
            Move {side === 'right' ? 'left' : 'right'}
          </button>
        )}
      </p>
      {/* A visitor who changed the accent in the experiment below keeps it until they ask for the original back. */}
      {rebranded && !failed && (
        <p className={styles.notice}>
          <span>
            The accent is <Color hex={brand.hex} /> now.
          </span>
          <button
            type='button'
            className={styles.textButton}
            onClick={(event) => {
              // This button leaves with the change it undoes. Focus moves to the dock's first verb instead of nowhere.
              const next = event.currentTarget.closest('[data-inspector-dock]')?.querySelector<HTMLElement>('[data-dock-verb]')
              controller.resetBrand()
              next?.focus()
            }}
          >
            Use the built color
          </button>
        </p>
      )}
    </div>
  )
}

/** A token path that breaks after a dot when it has to wrap, never inside a name. */
function TokenPath({ path }: { path: string }) {
  return path.split('.').map((segment, i) => (
    <Fragment key={i}>
      {i > 0 && (
        <>
          .<wbr />
        </>
      )}
      {segment}
    </Fragment>
  ))
}

/** The id of the one sentence that says what a token row does. Every row points at it, so it is read once per row at most and written once. */
const RowHint = createContext<string | undefined>(undefined)

const CURVE = { width: 40, height: 20 }

/**
 * An easing drawn as what it is: progress against time. A marker rides it, moving across at a steady speed
 * while it rises by the curve itself, so it shows the curve's character and not just its shape.
 */
function EasingCurve({ css }: { css: string }) {
  const points = /cubic-bezier\(([^)]+)\)/.exec(css)?.[1].split(',').map(Number)
  if (!points || points.length !== 4 || points.some(Number.isNaN)) return null
  const [x1, y1, x2, y2] = points
  const { width, height } = CURVE
  const at = (x: number, y: number) => `${(x * width).toFixed(1)} ${((1 - y) * height).toFixed(1)}`

  return (
    <span className={styles.curve} style={{ '--curve': css, '--curve-width': `${width}px`, '--curve-height': `${height}px` } as CSSProperties} aria-hidden='true'>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} fill='none' overflow='visible'>
        <path d={`M${at(0, 0)} C${at(x1, y1)} ${at(x2, y2)} ${at(1, 1)}`} stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      </svg>
      <span className={styles.curveMarker}>
        <i />
      </span>
    </span>
  )
}

interface TokenChainProps {
  chain: ResolvedChain
  /** This chain's place in the dock's row order, which sets when it resolves. */
  start: number
  contrast?: Contrast | null
  /** True where the dock's status line already states the finding, so the chain marks the row without repeating the sentence. */
  quiet?: boolean
}

/** One token's path to a raw value. Each row lights up every element that token paints. */
function TokenChain({ chain, start, contrast, quiet }: TokenChainProps) {
  const controller = useInspectorController()
  const lit = useInspector((state) => state.lit?.path ?? null)
  const severed = useInspector((state) => state.severedChain)
  const hint = use(RowHint)
  const last = start + chain.steps.length
  const cut = chain.steps.some((step) => step.finding)

  return (
    <>
    {/* Safari drops list semantics from a list with no markers. The role puts them back. */}
    <ol role='list' className={styles.chain} style={{ '--start': start, '--rows': chain.steps.length + 1 } as CSSProperties}>
      {chain.steps.map((step, i) => (
        <li key={step.path} className={styles.row} data-broken={step.finding ? '' : undefined} style={{ '--i': start + i } as CSSProperties}>
          <button
            type='button'
            className={styles.token}
            aria-label={`${step.path}, ${step.context ? `${step.layer} layer, ${step.context}` : `${step.layer} layer`}`}
            aria-describedby={hint}
            data-token-row=''
            data-lit={lit === step.path ? '' : undefined}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') controller.showUsers(step.path)
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') controller.clearUsers()
            }}
            onFocus={() => controller.showUsers(step.path, { announce: true })}
            onBlur={controller.clearUsers}
            onClick={() => controller.showUsers(step.path, { announce: true })}
          >
            <code>
              <TokenPath path={step.path} />
            </code>
          </button>
          <span className={styles.layer}>{step.context ? `${step.layer}, ${step.context}` : step.layer}</span>
          {step.finding && !quiet && (
            <p className={styles.finding}>
              <code>{step.finding.ruleId}</code> {step.finding.message}
            </p>
          )}
        </li>
      ))}
      <li className={styles.row} data-value={chain.value.kind} style={{ '--i': last } as CSSProperties}>
        {chain.value.kind === 'color' && <span className={styles.swatch} style={{ background: chain.value.css }} aria-hidden='true' />}
        <span className={styles.valueMain}>
          <code className={styles.value}>{chain.value.text}</code>
          {chain.value.literal && <span className={styles.literal}>literal</span>}
          {chain.value.kind === 'duration' && (
            <span className={styles.durationBar} aria-hidden='true'>
              <span style={{ '--d': chain.value.css } as CSSProperties} />
            </span>
          )}
          {chain.value.kind === 'easing' && <EasingCurve css={chain.value.css} />}
        </span>
        {contrast && (
          <span className={styles.contrast} data-failed={contrast.ratio < contrast.floor || undefined}>
            {contrast.ratio.toFixed(2)}:1 {contrast.ratio >= contrast.floor ? 'AA' : 'below AA'}
          </span>
        )}
      </li>
    </ol>
    {/* Under a broken chain hangs the token it was cut from. That one still moves when the brand does. */}
    {cut && severed && <Severed chain={severed} />}
    </>
  )
}

function PropertySection({ property, start }: { property: PropertyReport; start: number }) {
  const starts = startsOf(property.chains.map((chain) => chain.steps.length + 1))
  return (
    <section className={styles.property}>
      <h4 className={styles.propertyName}>{property.label}</h4>
      {property.chains.map((chain, i) => (
        <TokenChain key={chain.steps[0].path} chain={chain} start={start + starts[i]} contrast={property.contrast} />
      ))}
      {property.expression && (
        <p className={styles.note}>
          <code>{property.expression}</code>
        </p>
      )}
      {property.raw && (
        <p className={styles.note}>
          <code>{property.raw}</code> Raw value. Not in the token graph yet.
        </p>
      )}
    </section>
  )
}

const rowsIn = (property: PropertyReport) => property.chains.reduce((rows, chain) => rows + chain.steps.length + 1, 0)

/** What a token row does, or what the lit one found. While inspecting by keyboard it also says which keys matter. */
function Where({ keys = false }: { keys?: boolean }) {
  const lit = useInspector((state) => state.lit)
  const keyboard = useInspector((state) => state.keyboard)
  return (
    <>
      <p className={styles.where}>
        {lit ? (
          <>
            {lit.count} {plural(lit.count, 'element', 'elements')} on this page {plural(lit.count, 'uses', 'use')} <code>{lit.path}</code>.
          </>
        ) : (
          'Point at, tab to, or tap a token to see every element on this page that uses it.'
        )}
      </p>
      {keys && keyboard && <p className={styles.keys}>Enter on an element reads its tokens here. Escape steps back to it, then stops inspecting.</p>}
    </>
  )
}

function Selection() {
  const controller = useInspectorController()
  const selection = useInspector((state) => state.selection)
  const pinned = useInspector((state) => state.pinned)
  const animate = useInspector((state) => state.animate)
  const theme = useInspector((state) => state.theme)
  const motion = useInspector((state) => state.motion)

  if (!selection) return <p className={styles.hint}>Reading the token graph.</p>

  const broken = selection.properties.some((property) => property.chains.some((chain) => chain.steps.some((step) => step.finding)))
  const starts = startsOf(selection.properties.map(rowsIn))
  return (
    <div data-animate={animate || undefined}>
      <header className={styles.selectionHeader}>
        <div>
          <h3 className={styles.title}>{selection.label}</h3>
          {selection.source && (
            <p className={styles.source}>
              <code>{selection.source}</code>
            </p>
          )}
          <p className={styles.context}>
            {theme === 'dark' ? 'Dark' : 'Light'} theme, {motion} motion
            {/* One button for both states, so focus has somewhere to stay when the state changes. */}
            <button
              type='button'
              className={styles.pin}
              data-pinned={pinned || undefined}
              aria-label={pinned ? 'Pinned. Unpin the selection' : 'Pin the selection'}
              onClick={controller.togglePin}
            >
              {pinned ? 'Pinned' : 'Pin'}
            </button>
          </p>
        </div>
        <button type='button' className={styles.close} aria-label='Stop inspecting' onClick={() => void controller.setInspecting(false)}>
          <CloseIcon size={16} />
        </button>
      </header>
      {broken && <BrokenCallout subject='this element' verb='paints' stays='stays' />}
      {selection.properties.length === 0 && <p className={styles.hint}>No token paints this element directly.</p>}
      {selection.properties.map((property, i) => (
        <PropertySection key={property.id} property={property} start={starts[i]} />
      ))}
      <Where keys />
    </div>
  )
}

/** A color the way the dock writes one: a swatch and its hex. */
function Color({ hex }: { hex: string }) {
  return (
    <span className={styles.color}>
      <span className={styles.chip} style={{ background: hex }} aria-hidden='true' />
      <code>{hex}</code>
    </span>
  )
}

interface BrokenCalloutProps {
  /** What the broken token paints, as the sentence names it: `this element`, `the 26 outlined elements`. */
  subject: string
  verb: 'paints' | 'paint'
  stays: 'stays' | 'stay'
}

/**
 * The token a broken one was cut from, shown hanging under the cut. Its value is a control: move the hue,
 * and this token changes while the broken one above it holds still. That is the whole cost of the broken rule.
 */
function Severed({ chain }: { chain: ResolvedChain }) {
  const controller = useInspectorController()
  const brand = useInspector((state) => state.brand)
  const lit = useInspector((state) => state.lit?.path ?? null)
  const hint = use(RowHint)
  const id = useId()
  const step = chain.steps[0]
  const debris = useRef<HTMLSpanElement>(null)
  const held = useInspector((state) => state.brokenChain?.value.text ?? '')

  // The moment the link is cut, the literal that replaced it spills: its own characters drop away from the cut.
  // It happens once, for the press that broke the rule, and not at all in the reduced motion context. It is set up
  // before the first paint, so the block is never seen hanging still and then starting to swing.
  useLayoutEffect(() => {
    const host = debris.current
    if (!host || !controller.takeSnap() || !durationMs('--semantic-duration-handoff')) return
    // This is the moment of the cut, so the piece that was cut loose swings once.
    host.parentElement?.setAttribute('data-cut', '')
    const pieces = [...held, ...held].slice(0, 12).map((character, i, all) => {
      const piece = document.createElement('span')
      const spread = (i / (all.length - 1)) * 2 - 1
      piece.className = styles.piece
      piece.style.setProperty('--dx', `${Math.round(spread * 120 + (Math.random() - 0.5) * 40)}px`)
      piece.style.setProperty('--dy', `${Math.round(70 + Math.random() * 60)}px`)
      piece.style.setProperty('--spin', `${Math.round((Math.random() - 0.5) * 240)}deg`)
      piece.style.setProperty('--i', String(i))
      const glyph = document.createElement('i')
      glyph.textContent = character
      piece.append(glyph)
      return piece
    })
    host.replaceChildren(...pieces)
    // The pieces clear themselves when the last one has landed. Nothing here undoes them early: this runs once
    // per break, and a cleanup would take them away again when React checks the effect a second time in development.
    pieces[pieces.length - 1].firstElementChild?.addEventListener('animationend', () => host.replaceChildren(), { once: true })
  }, [controller, held])

  return (
    <div className={styles.severed}>
      <span ref={debris} className={styles.debris} aria-hidden='true' />
      <p className={styles.severedNote}>No longer followed</p>
      <ol role='list' className={styles.chain}>
        <li className={styles.row}>
          <button
            type='button'
            className={styles.token}
            aria-label={`${step.path}, ${step.layer} layer`}
            aria-describedby={hint}
            data-token-row=''
            data-lit={lit === step.path ? '' : undefined}
            onFocus={() => controller.showUsers(step.path, { announce: true })}
            onBlur={controller.clearUsers}
            onClick={() => controller.showUsers(step.path, { announce: true })}
          >
            <code>
              <TokenPath path={step.path} />
            </code>
          </button>
          <span className={styles.layer}>{step.layer}</span>
        </li>
      </ol>
      <div className={styles.hueRow}>
        <label htmlFor={id}>
          <Color hex={chain.value.text} />
        </label>
        <Slider
          id={id}
          className={styles.hue}
          style={{ '--slider-thumb': brand.hex } as CSSProperties}
          min={0}
          max={controller.brand.max}
          step={1}
          value={brand.hue}
          onValueChange={controller.setBrand}
          aria-label={`Hue of ${step.path}`}
          aria-valuetext={`Hue ${brand.hue}, ${brand.hex}`}
        />
      </div>
    </div>
  )
}

/** What breaking the rule costs. Before the color changes it is a promise. After, it is on the page. */
function BrokenCallout({ subject, verb, stays }: BrokenCalloutProps) {
  const severed = useInspector((state) => state.severed)
  const stranded = useInspector((state) => state.stranded)
  const base = severed ? <code>{severed}</code> : 'the base color'

  return (
    <div className={styles.callout}>
      {stranded ? (
        <p>
          <strong>The change did not land.</strong> {subject.charAt(0).toUpperCase() + subject.slice(1)} still {verb} <Color hex={stranded.held} />. Restore the rule and{' '}
          {verb === 'paints' ? 'it catches' : 'they catch'} up.
        </p>
      ) : (
        <p>
          <strong>Same colors, broken chain.</strong> Change {base} and {subject} {stays} behind.
        </p>
      )}
    </div>
  )
}

function BrokenRule() {
  const chain = useInspector((state) => state.brokenChain)
  const count = useInspector((state) => state.lit?.count ?? 0)
  const subject = count ? `the ${count} outlined ${plural(count, 'element', 'elements')}` : 'everything this token paints'

  return (
    <div data-animate=''>
      <BrokenCallout subject={subject} verb={count === 1 ? 'paints' : 'paint'} stays={count === 1 ? 'stays' : 'stay'} />
      {chain && <TokenChain chain={chain} start={0} quiet />}
    </div>
  )
}

function PreviewChains({ preview }: { preview: Preview }) {
  const starts = startsOf(preview.properties.map((property) => property.chain.steps.length + 1))
  return (
    <div className={styles.preview}>
      <h3 className={styles.title}>{preview.label}</h3>
      {preview.properties.map((property, i) => (
        <section key={property.id} className={styles.property}>
          <h4 className={styles.propertyName}>{property.label}</h4>
          <TokenChain chain={property.chain} start={starts[i]} contrast={property.contrast} />
        </section>
      ))}
      {/* The rows work before anyone turns inspect on, and this is the only thing that says so. */}
      <Where />
    </div>
  )
}

interface InspectorBodyProps {
  /** What the dock shows before the visitor inspects anything. A floating dock has none. */
  preview?: Preview
}

export function InspectorBody({ preview }: InspectorBodyProps) {
  const inspecting = useInspector((state) => state.inspecting)
  const floating = useInspector((state) => state.floating)
  const broken = useInspector((state) => state.broken)
  const selectionId = useInspector((state) => state.selectionId)
  // The dock in the page is out of sight while the floating one is in use, but on a narrow screen it is still in
  // the page's flow. If it followed every selection its height would change with each one, and everything under
  // it would move: a control that had just taken focus could end up under the sheet. So it keeps its resting
  // content until the floating dock is put away.
  const reading = inspecting && !(preview && floating)

  const hint = useId()

  return (
    <RowHint value={hint}>
      <p id={hint} hidden>
        Shows every element on this page that uses this token.
      </p>
      {/* A new selection is a new scroll position, so the body remounts with it. */}
      <div key={reading ? selectionId : broken ? 'broken' : 'preview'} className={styles.body}>
        {reading ? <Selection /> : broken ? <BrokenRule /> : preview ? <PreviewChains preview={preview} /> : null}
      </div>
    </RowHint>
  )
}

/** The verbs: Inspect, Break a rule, and the motion context. */
export function InspectorControls() {
  const controller = useInspectorController()
  const inspecting = useInspector((state) => state.inspecting)
  const broken = useInspector((state) => state.broken)
  const motion = useInspector((state) => state.motion)
  const motionLabel = useId()

  return (
    <div className={styles.footer}>
      <div className={styles.actions}>
        <Button variant='accent' data-dock-verb='' onClick={(event) => void controller.toggleInspecting(event.currentTarget)}>
          {inspecting ? 'Stop inspecting' : 'Inspect this page'}
        </Button>
        <Button variant='secondary' onClick={() => void controller.toggleBroken()}>
          {broken ? 'Restore the rule' : 'Break a rule'}
        </Button>
      </div>
      {/* Motion is a context like the theme: the same tokens, rerouted. Slow sends every duration to a quarter of its speed. */}
      <div className={styles.motionRow}>
        <span id={motionLabel} className={styles.motionLabel}>
          Motion
        </span>
        <Segmented aria-labelledby={motionLabel} value={motion} onValueChange={controller.setMotion}>
          <SegmentedOption value='reduced'>Reduced</SegmentedOption>
          <SegmentedOption value='default'>Default</SegmentedOption>
          <SegmentedOption value='slow'>Slow</SegmentedOption>
        </Segmented>
        <code className={styles.readout}>reveal {controller.reveal[motion]}</code>
      </div>
    </div>
  )
}
