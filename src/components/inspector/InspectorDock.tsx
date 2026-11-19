'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import ColorLink from './ColorLink'
import { Segmented, SegmentedOption } from '@/components/ui/Segmented'
import { Slider } from '@/components/ui/Slider'
import { contrast } from '@/lib/inspector/brand'
import { tokenHref } from '@/lib/inspector/token-location'
import type { ChainValue, ResolvedChain } from '@/lib/inspector/types'
import { durationMs, easing } from '@/lib/motion-tokens'
import { useInspector, useInspectorController } from './InspectorProvider'
import { Color, RowHint, TokenChain } from './InspectorTokenChain'
import { observeChainPropagation } from './chain-propagation'
import { LoadedInspectorDetails as Details } from './load-inspector-details'
import styles from './Inspector.module.css'

// The inspector's dock, in parts. Compose the ones a placement needs:
//
//   <InspectorDock placement='inline'>
//     <InspectorStatus />
//     <InspectorBody>{preview}</InspectorBody>
//     <InspectorControls />
//   </InspectorDock>
//
// Every part reads the one inspector in <InspectorProvider>, so two docks on
// a page always agree.

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many)

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
    const host = slot.current
    if (!host) return
    controller.registerSlot(host)
    // The specimen has a natural height. Keep that space when a selection
    // replaces it so the project immediately below stays under the pointer.
    const observer = new ResizeObserver(() => {
      if (host.querySelector('[data-brand-preview]')) {
        host.style.setProperty('--preview-height', `${host.getBoundingClientRect().height}px`)
      }
    })
    observer.observe(host)
    return () => {
      observer.disconnect()
      controller.registerSlot(null)
    }
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

  useEffect(() => {
    const element = dock.current
    return () => { if (element) controller.stopHandoff(element) }
  }, [controller])

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
      // This persistent control stays live while project titles transition around it.
      style={style}
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
  const inspecting = useInspector((state) => state.inspecting)
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
      {rebranded && !failed && (inspecting || floating) && (
        <p className={styles.notice}>
          <span>
            The accent is <Color hex={brand.hex} /> now.
          </span>
          <button
            type='button'
            data-dock-focus='reset-brand'
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

interface InspectorBrandPreviewProps {
  built: Record<'dark' | 'light', { chain: ResolvedChain; foreground: string }>
}

function LinkValues({ source, button }: { source: string; button: string }) {
  return (
    <p className={styles.linkReadout}>
      <span>Source <code>{source}</code></span>
      <span>Button <code>{button}</code></span>
    </p>
  )
}

export function InspectorBrandPreview({ built }: InspectorBrandPreviewProps) {
  const theme = useInspector((state) => state.theme)
  const live = useInspector((state) => state.brandPreview)
  const broken = useInspector((state) => state.broken)
  const source = useInspector((state) => state.severedChain?.value)
  const stranded = useInspector((state) => state.stranded)
  const finding = useInspector((state) => state.check.findings[0])
  const { chain, foreground } = live ?? built[theme]
  const status = !broken ? 'Pull the links apart, then change the hue.'
    : stranded ? 'The source changed. The button kept its color.'
    : 'Now move the hue. Watch the button stay behind.'

  return (
    <div className={styles.brandPreview} data-brand-preview=''>
      <RuleButton specimen>
        <ColorLink source={broken ? source?.css : live?.chain.value.css} />
      </RuleButton>
      {live ? <LinkValues source={source?.text ?? chain.value.text} button={chain.value.text} /> : (
        <>
          <div className={styles.builtDark}><LinkValues source={built.dark.chain.value.text} button={built.dark.chain.value.text} /></div>
          <div className={styles.builtLight}><LinkValues source={built.light.chain.value.text} button={built.light.chain.value.text} /></div>
        </>
      )}
      <InspectorHueControl value={chain.value} description={status} />
      <details className={styles.proof}>
        <summary>{finding ? `See why ${finding.ruleId} failed` : 'Trace this color'}</summary>
        {live ? <TokenChain chain={chain} start={0} contrast={{ ratio: contrast(foreground, chain.value.text), floor: 4.5 }} /> : (
          // Both built contexts are present before hydration. CSS shows the one
          // that paints the page, so a light first frame never reports dark values.
          <>
            <div className={styles.builtDark}>
              <TokenChain chain={built.dark.chain} start={0} contrast={{ ratio: contrast(built.dark.foreground, built.dark.chain.value.text), floor: 4.5 }} />
            </div>
            <div className={styles.builtLight}>
              <TokenChain chain={built.light.chain} start={0} contrast={{ ratio: contrast(built.light.foreground, built.light.chain.value.text), floor: 4.5 }} />
            </div>
          </>
        )}
        <Link href={tokenHref(chain.steps[0].path)} onNavigate={() => {
          document.documentElement.dataset.routeNavigation = 'direct'
        }}>Open in the token graph</Link>
      </details>
    </div>
  )
}

export function InspectorHueControl({ value, description = 'Change the accent here. Select a token to see where it is used.' }: { value: ChainValue; description?: string }) {
  const controller = useInspectorController()
  const brand = useInspector((state) => state.brand)
  const broken = useInspector((state) => state.broken)
  const original = brand.hue === controller.brand.built.hue
  const color = broken ? brand.hex : value.text
  const id = useId()
  const help = useId()
  const hueInput = useRef<HTMLInputElement>(null)

  return (
    <>
      <div className={styles.brandControl}>
        <label htmlFor={id}>Accent hue</label>
        <span className={styles.brandRange}>
          <Slider
            ref={hueInput}
            data-dock-focus='accent-hue'
            id={id}
            style={{ '--slider-thumb': broken ? color : 'var(--color-accent-primary)', '--slider-track': 'var(--color-ink-muted)' } as CSSProperties}
            min={0}
            max={controller.brand.max}
            step={1}
            value={brand.hue}
            onValueChange={controller.setBrand}
            onFocus={controller.warm}
            onPointerEnter={controller.warm}
            aria-describedby={help}
            aria-valuetext={`${brand.hue} degrees`}
          />
          <button type='button' className={styles.brandReset} data-dock-focus='reset-accent' disabled={original} onClick={() => {
            hueInput.current?.focus()
            controller.resetBrand()
          }}>
            Reset
          </button>
        </span>
      </div>
      <p id={help} className={styles.brandHelp}>{description}</p>
    </>
  )
}

interface InspectorBodyProps {
  /** What the dock shows before the visitor inspects anything. A floating dock has none. */
  children?: ReactNode
}

export function InspectorBody({ children }: InspectorBodyProps) {
  const controller = useInspectorController()
  const inspecting = useInspector((state) => state.inspecting)
  const floating = useInspector((state) => state.floating)
  const broken = useInspector((state) => state.broken)
  const selectionId = useInspector((state) => state.selectionId)
  const loadStatus = useInspector((state) => state.loadStatus)
  // The dock in the page is out of sight while the floating one is in use, but on a narrow screen it is still in
  // the page's flow. If it followed every selection its height would change with each one, and everything under
  // it would move: a control that had just taken focus could end up under the sheet. So it keeps its resting
  // content until the floating dock is put away.
  const reading = inspecting && !(children && floating)
  const body = useRef<HTMLDivElement>(null)
  const bodyKey = reading ? selectionId : 'preview'

  useLayoutEffect(() => {
    return observeChainPropagation(() => body.current, controller, {
      node: styles.propagationNode,
      link: styles.propagationLink,
      specimen: `.${styles.brandSpecimen}`,
      timing: () => ({
        reveal: durationMs('--semantic-duration-reveal'),
        causal: durationMs('--semantic-duration-causal'),
        easing: easing(),
        linear: easing('--semantic-easing-linear'),
      }),
    })
  }, [controller])

  const hint = useId()

  return (
    <RowHint value={hint}>
      <p id={hint} hidden>
        Shows every element on this page that uses this token.
      </p>
      {/* A new selection is a new scroll position, so the body remounts with it. */}
      <div key={bodyKey} ref={body} className={styles.body} data-inspector-body=''>
        {reading || (broken && !children) ? (
          !Details || (reading && loadStatus !== 'idle')
            ? <p className={styles.hint}>Reading the token graph.</p>
            : <Details view={reading ? 'selection' : 'broken'} />
        ) : children}
      </div>
    </RowHint>
  )
}

function RuleButton({ specimen = false, children }: { specimen?: boolean; children?: ReactNode }) {
  const controller = useInspectorController()
  const broken = useInspector((state) => state.broken)
  const ruleStatus = useInspector((state) => state.ruleStatus)
  const help = useId()
  const busy = ruleStatus === 'loading'
  const label = busy ? 'Loading rule' : ruleStatus === 'error' ? 'Retry rule demo'
    : specimen ? (broken ? 'Repair the link' : 'Break the link') : (broken ? 'Restore the rule' : 'Break a rule')
  return (
    <>
      <Button variant={specimen ? 'ghost' : 'secondary'} className={specimen ? styles.brandSpecimen : undefined}
        data-dock-focus='rule' data-separated={broken || undefined}
        aria-busy={busy || undefined} aria-disabled={busy || undefined}
        aria-describedby={ruleStatus === 'error' ? help : undefined} onClick={() => void controller.toggleBroken()}>
        {children}<span>{label}</span>
      </Button>
      {ruleStatus === 'error' && <p id={help} className={styles.hint}>The rule demo could not load. Try again.</p>}
    </>
  )
}

export function InspectorControls({ ruleInPreview = false }: { ruleInPreview?: boolean }) {
  const controller = useInspectorController()
  const inspecting = useInspector((state) => state.inspecting)
  const motion = useInspector((state) => state.motion)
  const motionLabel = useId()

  return (
    <div className={styles.footer}>
      <div className={styles.actions}>
        <Button variant='secondary' data-dock-verb='' data-dock-focus='inspect' onClick={(event) => void controller.toggleInspecting(event.currentTarget)}>
          {inspecting ? 'Stop inspecting' : 'Inspect this page'}
        </Button>
        {(!ruleInPreview || inspecting) && <RuleButton />}
      </div>
      <div className={styles.motionRow}>
        <span id={motionLabel} className={styles.motionLabel}>
          Motion
        </span>
        <Segmented aria-labelledby={motionLabel} value={motion} onValueChange={controller.setMotion}>
          <SegmentedOption value='reduced' data-dock-focus='motion:reduced'>Reduced</SegmentedOption>
          <SegmentedOption value='default' data-dock-focus='motion:default'>Default</SegmentedOption>
          <SegmentedOption value='slow' data-dock-focus='motion:slow'>Slow</SegmentedOption>
        </Segmented>
        <code className={styles.readout}>hover {controller.hoverDuration[motion]}</code>
      </div>
    </div>
  )
}
