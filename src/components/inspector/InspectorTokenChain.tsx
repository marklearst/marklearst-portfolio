'use client'

import { createContext, use, type CSSProperties, type ReactNode } from 'react'
import TokenPath from '@/components/tokens/TokenPath'
import type { Contrast, ResolvedChain } from '@/lib/inspector/types'
import { useInspector, useInspectorController } from './InspectorProvider'
import styles from './Inspector.module.css'

/** The id of the one sentence that says what a token row does. Every row points at it, so it is read once per row at most and written once. */
export const RowHint = createContext<string | undefined>(undefined)

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
  /** Optional detail shown after the chain, such as its severed reference. */
  children?: ReactNode
}

/** One token's path to a raw value. Each row lights up every element that token paints. */
export function TokenChain({ chain, start, contrast, quiet, children }: TokenChainProps) {
  const controller = useInspectorController()
  const lit = useInspector((state) => state.lit?.path ?? null)
  const hint = use(RowHint)
  const last = start + chain.steps.length

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
            data-dock-focus={`token:${step.path}`}
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
    {children}
    </>
  )
}

/** A color the way the dock writes one: a swatch and its hex. */
export function Color({ hex }: { hex: string }) {
  return (
    <span className={styles.color}>
      <span className={styles.chip} style={{ background: hex }} aria-hidden='true' />
      <code>{hex}</code>
    </span>
  )
}

