'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import styles from '@/components/home/Hero.module.css'

interface HeroXRayProps {
  /** The introduction as the page renders it. */
  children: ReactNode
  /** The same introduction drawn as its own blueprint. It sits on top, cut off at the line. */
  blueprint: ReactNode
}

/**
 * Splits the introduction with a line the visitor can drag. On one side is the
 * page, and on the other the same content as a blueprint: outlined type, its
 * baselines, the spacing between parts, and the tokens each part reads.
 *
 * The control is the browser's range input, so a pointer, a finger, and the
 * arrow keys all move the line. Only its thumb takes the pointer, so the links
 * under the blueprint still work.
 *
 * Where the line rests is the stylesheet's call (`--rest` in Hero.module.css),
 * because it differs by screen width. This only takes over once someone moves it.
 *
 * While the line moves, a lens follows just behind it and the drawing it has
 * uncovered comes into focus there. That is all in the stylesheet too.
 */
export default function HeroXRay({ children, blueprint }: HeroXRayProps) {
  const stage = useRef<HTMLDivElement>(null)
  const [rest, setRest] = useState(50)
  const [moved, setMoved] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  // Once someone has taken hold of the line it is theirs: the intro's scan stops driving it and never takes it back.
  const [touched, setTouched] = useState(false)
  const peel = moved ?? rest

  // The control has to sit where the stylesheet rests the line, and that changes with the introduction's width:
  // a phone turned on its side has a different resting place. The observer reports once at the start, too.
  useEffect(() => {
    const node = stage.current
    if (!node) return
    const observer = new ResizeObserver(() => {
      const resting = Number.parseFloat(getComputedStyle(node).getPropertyValue('--rest'))
      if (Number.isFinite(resting)) setRest(resting)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={stage}
      className={styles.stage}
      style={moved === null ? undefined : ({ '--peel': `${moved}%` } as CSSProperties)}
      data-dragging={dragging || undefined}
      data-touched={touched || undefined}
    >
      <div className={styles.rendered}>{children}</div>
      <div className={styles.xray} aria-hidden='true' inert data-inspector-ui=''>
        {blueprint}
      </div>
      <div className={styles.scanner} data-inspector-ui=''>
        <div className={styles.lens} aria-hidden='true' />
        <input
          type='range'
          className={styles.scan}
          min={0}
          max={100}
          step={1}
          value={peel}
          aria-label='Blueprint. How much of this introduction is shown as the tokens it is made of.'
          aria-valuetext={`${100 - peel} percent shown as tokens`}
          onChange={(event) => {
            setTouched(true)
            setMoved(event.currentTarget.valueAsNumber)
          }}
          onPointerDown={() => {
            setTouched(true)
            setDragging(true)
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        />
        <div className={styles.line} aria-hidden='true'>
          <span className={styles.lineLabel}>Blueprint</span>
          <span className={styles.grip}>
            <svg viewBox='0 0 12 16' width='12' height='16' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M4.5 4 1.5 8l3 4M7.5 4l3 4-3 4' />
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}
