'use client'

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import styles from './HeroExamples.module.css'

interface HeroExample {
  id: string
  label: string
  children: ReactNode
}

const morphTiming = { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
const maximumMorphDistance = 320

export default function HeroExamples({ examples }: { examples: readonly HeroExample[] }) {
  const id = useId()
  const [{ value, motion }, setSelection] = useState({ value: examples[0]?.id, motion: false })
  const shellRef = useRef<HTMLDivElement>(null)
  const activePanelRef = useRef<HTMLDivElement>(null)
  const animationsRef = useRef<Animation[]>([])
  const pendingChangeRef = useRef<{ height: number; direction: number; motion: boolean } | null>(null)
  const activeIndex = Math.max(0, examples.findIndex(example => example.id === value))

  const cancelMotion = useCallback(() => {
    animationsRef.current.forEach(animation => animation.cancel())
    animationsRef.current = []
    shellRef.current?.removeAttribute('data-morphing')
  }, [])

  function select(nextValue: string, pointer: boolean) {
    const shouldAnimate = pointer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!shouldAnimate) cancelMotion()
    if (nextValue === value) {
      if (!shouldAnimate && motion) setSelection({ value, motion: false })
      return
    }

    pendingChangeRef.current = {
      // Read the current animated shell so rapid reversals resume from its visible size.
      height: shellRef.current?.getBoundingClientRect().height ?? 0,
      direction: examples.findIndex(example => example.id === nextValue) > activeIndex ? 1 : -1,
      motion: shouldAnimate,
    }
    setSelection({ value: nextValue, motion: shouldAnimate })
  }

  useLayoutEffect(() => {
    const change = pendingChangeRef.current
    pendingChangeRef.current = null
    cancelMotion()

    const shell = shellRef.current
    const panel = activePanelRef.current
    if (!change || !shell || !panel) return

    // Restoring display can replay a nested demo's old CSS reveal. Its state stays
    // mounted, but only this newly requested example switch should animate.
    panel.getAnimations?.({ subtree: true }).forEach(animation => {
      const endTime = animation.effect?.getComputedTiming().endTime
      if (typeof CSSAnimation !== 'undefined' && animation instanceof CSSAnimation
        && typeof endTime === 'number' && Number.isFinite(endTime)) animation.finish()
    })

    if (!change.motion || typeof panel.animate !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const nextHeight = panel.getBoundingClientRect().height
    const distance = Math.abs(change.height - nextHeight)
    const animations: Animation[] = []

    // A single measured shell changes height; its fixed-width contents never scale.
    // Long open disclosures settle directly, avoiding a large empty collapse.
    if (change.height > 0 && distance > 1 && distance <= maximumMorphDistance) {
      shell.setAttribute('data-morphing', '')
      animations.push(shell.animate([
        { height: `${change.height}px` },
        { height: `${nextHeight}px` },
      ], morphTiming))
    }

    animations.push(panel.animate([
      { opacity: 0.65, transform: `translateX(${change.direction * 16}px)` },
      { opacity: 1, transform: 'translateX(0)' },
    ], { ...morphTiming, duration: 220 }))
    animationsRef.current = animations

    void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (animationsRef.current !== animations) return
      animationsRef.current = []
      shell.removeAttribute('data-morphing')
    })

    return cancelMotion
  }, [value, cancelMotion])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const shell = shellRef.current
    const stopIfReduced = () => { if (preference.matches) cancelMotion() }
    preference.addEventListener('change', stopIfReduced)
    shell?.addEventListener('toggle', cancelMotion, true)
    return () => {
      preference.removeEventListener('change', stopIfReduced)
      shell?.removeEventListener('toggle', cancelMotion, true)
      cancelMotion()
    }
  }, [cancelMotion])

  if (examples.length === 0) return null

  return (
    <div className={styles.examples}>
      <div className={styles.heading}>
        <h2>Explore the implementation</h2>
        <div className={styles.choices} role='group' aria-label='Choose a working example'
          data-motion={motion}
          style={{ '--example-count': examples.length, '--example-index': activeIndex } as CSSProperties}>
          <span className={styles.selection} aria-hidden='true' />
          {examples.map(example => (
            <button key={example.id} id={`${id}-${example.id}-label`} type='button'
              aria-pressed={value === example.id} aria-controls={`${id}-${example.id}`}
              onClick={event => select(example.id, event.detail > 0)}>
              {example.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={shellRef} className={styles.panels}>
        {examples.map(example => (
          <div key={example.id} id={`${id}-${example.id}`} className={styles.panel}
            ref={value === example.id ? activePanelRef : null}
            role='region' aria-labelledby={`${id}-${example.id}-label`}
            data-active={value === example.id} hidden={value !== example.id}>
            {example.children}
          </div>
        ))}
      </div>
    </div>
  )
}
