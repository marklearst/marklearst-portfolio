'use client'

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import styles from './HeroExamples.module.css'

interface HeroExample {
  id: string
  label: string
  children: ReactNode
}

const EXIT_MS = 100
const HEIGHT_MS = 180
const HEIGHT_EASE = 'cubic-bezier(.22, 1, .36, 1)'
const HEIGHT_SNAP_PX = 320

/** Stiff + damped, clamped — same family as the primary nav pill. */
function springIndex(from: number, to: number, onUpdate: (value: number) => void) {
  const stiffness = 320
  const damping = 38
  let position = from
  let velocity = 0
  let frame = 0
  let previous = performance.now()

  const tick = (now: number) => {
    const dt = Math.min(0.032, (now - previous) / 1000)
    previous = now
    velocity += (-stiffness * (position - to) - damping * velocity) * dt
    position += velocity * dt

    if ((to >= from && position > to) || (to <= from && position < to)) {
      position = to
      velocity = 0
    }

    onUpdate(position)

    if (Math.abs(position - to) < 0.0008 && Math.abs(velocity) < 0.02) {
      onUpdate(to)
      return
    }

    frame = requestAnimationFrame(tick)
  }

  frame = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(frame)
}

export default function HeroExamples({ examples }: { examples: readonly HeroExample[] }) {
  const id = useId()
  const [{ value, motion }, setSelection] = useState({ value: examples[0]?.id, motion: false })
  const [exitingId, setExitingId] = useState<string | null>(null)
  const exitTimer = useRef<number | null>(null)
  const choicesRef = useRef<HTMLDivElement>(null)
  const panelsRef = useRef<HTMLDivElement>(null)
  const pillIndex = useRef(0)
  const stopSpring = useRef<(() => void) | null>(null)
  const stopHeight = useRef<(() => void) | null>(null)
  const shellHeight = useRef<number | null>(null)
  const exitingIdRef = useRef<string | null>(null)
  const pointerIntent = useRef(false)
  const activeIndex = Math.max(0, examples.findIndex(example => example.id === value))

  const stopExit = useCallback(() => {
    if (exitTimer.current !== null) {
      window.clearTimeout(exitTimer.current)
      exitTimer.current = null
    }
    setExitingId(null)
  }, [])

  function select(nextValue: string, pointer: boolean) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const shouldAnimate = pointer && !reduced

    if (nextValue === value) {
      if (!shouldAnimate && motion) setSelection({ value, motion: false })
      return
    }

    // Interruptible: drop the outgoing layer so spam stays continuous.
    stopExit()

    if (shouldAnimate) {
      setExitingId(value)
      exitTimer.current = window.setTimeout(() => {
        exitTimer.current = null
        setExitingId(null)
      }, EXIT_MS)
    }

    setSelection({ value: nextValue, motion: shouldAnimate })
  }

  useLayoutEffect(() => {
    exitingIdRef.current = exitingId
  }, [exitingId])

  useLayoutEffect(() => {
    const choices = choicesRef.current
    if (!choices) return

    const from = pillIndex.current
    const to = activeIndex
    stopSpring.current?.()
    stopSpring.current = null

    const setPill = (next: number) => {
      pillIndex.current = next
      choices.style.setProperty('--pill-index', String(next))
    }

    if (!motion || from === to) {
      setPill(to)
      return
    }

    setPill(from)
    stopSpring.current = springIndex(from, to, setPill)
    return () => {
      stopSpring.current?.()
      stopSpring.current = null
    }
  }, [activeIndex, motion])

  useLayoutEffect(() => {
    const panels = panelsRef.current
    if (!panels) return

    const active = panels.querySelector<HTMLElement>(':scope > [data-active]')
    if (!active) return

    const to = active.offsetHeight
    const from = shellHeight.current ?? panels.getBoundingClientRect().height

    stopHeight.current?.()
    stopHeight.current = null

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const delta = Math.abs(to - from)

    const release = (height: number) => {
      shellHeight.current = height
      panels.style.height = ''
      panels.style.overflow = ''
    }

    const lock = (height: number) => {
      shellHeight.current = height
      panels.style.height = `${height}px`
      panels.style.overflow = 'hidden'
    }

    if (reduced || delta <= 1 || delta > HEIGHT_SNAP_PX) {
      release(to)
      return
    }

    lock(from)

    const anim = panels.animate(
      [{ height: `${from}px` }, { height: `${to}px` }],
      { duration: HEIGHT_MS, easing: HEIGHT_EASE, fill: 'forwards' },
    )

    let cancelled = false
    stopHeight.current = () => {
      cancelled = true
      const current = panels.getBoundingClientRect().height
      anim.cancel()
      lock(current)
    }

    anim.finished.then(() => {
      if (cancelled) return
      stopHeight.current = null
      anim.cancel()
      shellHeight.current = to
      // Keep an explicit height while the outgoing panel is still in flow.
      if (exitingIdRef.current !== null) {
        lock(to)
        return
      }
      release(to)
    }).catch(() => {})

    return () => {
      stopHeight.current?.()
      stopHeight.current = null
    }
  }, [value])

  useLayoutEffect(() => {
    if (exitingId !== null || stopHeight.current) return
    const panels = panelsRef.current
    if (!panels || !panels.style.height) return
    const active = panels.querySelector<HTMLElement>(':scope > [data-active]')
    panels.style.height = ''
    panels.style.overflow = ''
    if (active) shellHeight.current = active.offsetHeight
  }, [exitingId])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => { if (preference.matches) stopExit() }
    preference.addEventListener('change', onChange)
    return () => {
      preference.removeEventListener('change', onChange)
      stopExit()
      stopSpring.current?.()
      stopHeight.current?.()
    }
  }, [stopExit])

  if (examples.length === 0) return null

  return (
    <div className={styles.examples}>
      <div className={styles.heading}>
        <h2>Explore the implementation</h2>
        <div
          ref={choicesRef}
          className={styles.choices}
          role='group'
          aria-label='Choose a working example'
          data-motion={motion || undefined}
          style={{
            '--example-count': examples.length,
            '--example-index': activeIndex,
          } as CSSProperties}
        >
          <span className={styles.selection} aria-hidden='true' />
          {examples.map(example => (
            <button
              key={example.id}
              id={`${id}-${example.id}-label`}
              type='button'
              aria-pressed={value === example.id}
              aria-controls={`${id}-${example.id}`}
              onPointerDown={() => { pointerIntent.current = true }}
              onClick={() => {
                const pointer = pointerIntent.current
                pointerIntent.current = false
                select(example.id, pointer)
              }}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={panelsRef} className={styles.panels}>
        {examples.map(example => {
          const isActive = value === example.id
          const isExiting = exitingId === example.id
          const isShown = isActive || isExiting
          return (
            <div
              key={example.id}
              id={`${id}-${example.id}`}
              className={styles.panel}
              role='region'
              aria-labelledby={`${id}-${example.id}-label`}
              data-active={isActive || undefined}
              data-follow={(isActive && motion) || undefined}
              data-exiting={isExiting || undefined}
              hidden={!isShown}
              inert={!isActive || undefined}
              aria-hidden={isActive ? undefined : true}
            >
              {example.children}
            </div>
          )
        })}
      </div>
    </div>
  )
}
