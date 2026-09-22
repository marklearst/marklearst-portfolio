'use client'

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import styles from './HeroExamples.module.css'

interface HeroExample {
  id: string
  label: string
  children: ReactNode
}

const EXIT_MS = 100

export default function HeroExamples({ examples }: { examples: readonly HeroExample[] }) {
  const id = useId()
  const [{ value, motion }, setSelection] = useState({ value: examples[0]?.id, motion: false })
  const [exitingId, setExitingId] = useState<string | null>(null)
  const exitTimer = useRef<number | null>(null)
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

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => { if (preference.matches) stopExit() }
    preference.addEventListener('change', onChange)
    return () => {
      preference.removeEventListener('change', onChange)
      stopExit()
    }
  }, [stopExit])

  if (examples.length === 0) return null

  return (
    <div className={styles.examples}>
      <div className={styles.heading}>
        <h2>Explore the implementation</h2>
        <div
          className={styles.choices}
          role='group'
          aria-label='Choose a working example'
          data-motion={motion || undefined}
          style={{ '--example-count': examples.length, '--example-index': activeIndex } as CSSProperties}
        >
          <span className={styles.selection} aria-hidden='true' />
          {examples.map(example => (
            <button
              key={example.id}
              id={`${id}-${example.id}-label`}
              type='button'
              aria-pressed={value === example.id}
              aria-controls={`${id}-${example.id}`}
              onClick={event => select(example.id, event.detail > 0)}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.panels}>
        {examples.map(example => {
          const isActive = value === example.id
          const isExiting = exitingId === example.id
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
              inert={!isActive || undefined}
              aria-hidden={!isActive}
            >
              {example.children}
            </div>
          )
        })}
      </div>
    </div>
  )
}
