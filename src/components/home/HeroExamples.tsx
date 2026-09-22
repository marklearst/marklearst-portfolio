'use client'

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import styles from './HeroExamples.module.css'

interface HeroExample {
  id: string
  label: string
  children: ReactNode
}

const morphTiming = { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
const exitTiming = { duration: 110, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }
const maximumMorphDistance = 320

export default function HeroExamples({ examples }: { examples: readonly HeroExample[] }) {
  const id = useId()
  const [{ value, motion }, setSelection] = useState({ value: examples[0]?.id, motion: false })
  const [exitingId, setExitingId] = useState<string | null>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const activePanelRef = useRef<HTMLDivElement | null>(null)
  const panelRefs = useRef(new Map<string, HTMLDivElement>())
  const animationsRef = useRef<Animation[]>([])
  const pendingChangeRef = useRef<{ height: number; motion: boolean; previousId: string } | null>(null)
  const activeIndex = Math.max(0, examples.findIndex(example => example.id === value))

  const stopAnimations = useCallback(() => {
    animationsRef.current.forEach(animation => animation.cancel())
    animationsRef.current = []
    shellRef.current?.removeAttribute('data-morphing')
  }, [])

  const cancelMotion = useCallback(() => {
    stopAnimations()
    setExitingId(null)
  }, [stopAnimations])

  function select(nextValue: string, pointer: boolean) {
    const shouldAnimate = pointer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!shouldAnimate) cancelMotion()
    if (nextValue === value) {
      if (!shouldAnimate && motion) setSelection({ value, motion: false })
      return
    }

    pendingChangeRef.current = {
      height: shellRef.current?.getBoundingClientRect().height ?? 0,
      motion: shouldAnimate,
      previousId: value,
    }
    setSelection({ value: nextValue, motion: shouldAnimate })
  }

  useLayoutEffect(() => {
    const change = pendingChangeRef.current
    pendingChangeRef.current = null
    stopAnimations()
    setExitingId(null)

    const shell = shellRef.current
    const panel = activePanelRef.current
    if (!change || !shell || !panel) return

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
    const outgoing = panelRefs.current.get(change.previousId)

    if (outgoing && outgoing !== panel) {
      setExitingId(change.previousId)
      animations.push(outgoing.animate([
        { opacity: 1, filter: 'blur(0)' },
        { opacity: 0, filter: 'blur(2px)' },
      ], exitTiming))
    }

    if (change.height > 0 && distance > 1 && distance <= maximumMorphDistance) {
      shell.setAttribute('data-morphing', '')
      animations.push(shell.animate([
        { height: `${change.height}px` },
        { height: `${nextHeight}px` },
      ], morphTiming))
    }

    animationsRef.current = animations

    void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (animationsRef.current !== animations) return
      animationsRef.current = []
      setExitingId(null)
      shell.removeAttribute('data-morphing')
    })

    return stopAnimations
  }, [value, stopAnimations])

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
        {examples.map(example => {
          const isActive = value === example.id
          const isExiting = exitingId === example.id
          return (
            <div key={example.id} id={`${id}-${example.id}`} className={styles.panel}
              ref={node => {
                if (node) panelRefs.current.set(example.id, node)
                else panelRefs.current.delete(example.id)
                if (isActive) activePanelRef.current = node
              }}
              role='region' aria-labelledby={`${id}-${example.id}-label`}
              data-active={isActive}
              data-follow={isActive && motion}
              data-exiting={isExiting}
              hidden={!isActive && !isExiting}>
              {example.children}
            </div>
          )
        })}
      </div>
    </div>
  )
}
