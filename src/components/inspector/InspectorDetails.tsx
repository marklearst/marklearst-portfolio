'use client'

import { use, useId, useLayoutEffect, useRef, type ComponentProps, type CSSProperties } from 'react'
import { CloseIcon } from '@/components/ui/Icon'
import { Slider } from '@/components/ui/Slider'
import TokenPath from '@/components/tokens/TokenPath'
import type { PropertyReport, ResolvedChain } from '@/lib/inspector/types'
import { durationMs } from '@/lib/motion-tokens'
import { useInspector, useInspectorController } from './InspectorProvider'
import { Color, RowHint, TokenChain as BaseTokenChain } from './InspectorTokenChain'
import styles from './Inspector.module.css'

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

function TokenChain(props: ComponentProps<typeof BaseTokenChain>) {
  const severed = useInspector((state) => state.severedChain)
  const cut = props.chain.steps.some((step) => step.finding)
  return <BaseTokenChain {...props}>{cut && severed && <Severed chain={severed} />}</BaseTokenChain>
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
          'Select a token to see where it is used.'
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
              data-dock-focus='pin'
              data-pinned={pinned || undefined}
              aria-label={pinned ? 'Pinned. Unpin the selection' : 'Pin the selection'}
              onClick={controller.togglePin}
            >
              {pinned ? 'Pinned' : 'Pin'}
            </button>
          </p>
        </div>
        <button type='button' className={styles.close} data-dock-focus='close' aria-label='Stop inspecting' onClick={() => void controller.setInspecting(false)}>
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
            data-dock-focus={`token:${step.path}`}
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
          data-dock-focus={`hue:${step.path}`}
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

/** Detail views arrive with the inspector engine, after intent or an explicit action. */
export default function InspectorDetails({ view }: { view: 'selection' | 'broken' }) {
  const findings = useInspector((state) => state.check.findings)

  return (
    <>
      {findings.length > 0 && (
        <div className={styles.findings}>
          {findings.map((finding) => (
            <p key={finding.ruleId + finding.path} className={styles.findingLine}>
              <code>{finding.ruleId}</code> <code>{finding.path}</code>: {finding.message}
            </p>
          ))}
        </div>
      )}
      {view === 'selection' ? <Selection /> : <BrokenRule />}
    </>
  )
}
