'use client'

import { useLayoutEffect, useReducer, useState, type RefObject } from 'react'
import { dockBlueprint } from './dock-blueprint'
import { durationMs } from '@/lib/motion-tokens'
import { INITIAL_FRAME, titleFrame } from './hero-titles'

// Sample only on interruption. Both rows count equally even when their lengths differ.
function incomingIsLegible(stage: HTMLElement | null) {
  if (!stage) return false
  const bounds = stage.getBoundingClientRect()
  const heading = stage.querySelector('h1')
  function visibleFraction(plane: string) {
    const rows = heading?.querySelectorAll(`[data-title-plane="${plane}"] [data-ink]`)
    let visible = 0
    for (const row of rows ?? []) {
      const box = row.getBoundingClientRect()
      if (box.width) visible += Math.max(0, Math.min(bounds.right, box.right) - Math.max(bounds.left, box.left)) / box.width
    }
    return visible
  }
  return visibleFraction('in') > visibleFraction('out')
}

export function useHeroTitles(stage: RefObject<HTMLDivElement | null>) {
  const [frame, dispatch] = useReducer(titleFrame, INITIAL_FRAME)

  const [hovered, setHovered] = useState(false)
  const pauseReading = hovered && frame.phase === 'reading'

  useLayoutEffect(() => {
    const node = stage.current
    if (!node) return
    const root = document.documentElement
    const bounds = node.getBoundingClientRect()
    let visible = bounds.bottom > 0 && bounds.top < innerHeight
    const context = () => ({
      motion: root.dataset.motion ?? 'default',
      blocked: !visible || document.hidden || root.hasAttribute('data-inspecting'),
    })
    const sync = () => dispatch({ type: 'context', context: context(), incoming: incomingIsLegible(node) })
    const enter = (event: PointerEvent) => setHovered(event.pointerType === 'mouse')
    const leave = () => setHovered(false)
    const intro = root.hasAttribute('data-hero-intro')
    dispatch({ type: 'start', intro, context: context() })
    if (intro) {
      try { sessionStorage.setItem('ml:hero-titles', 'seen') } catch { /* The document still remembers this visit. */ }
    }
    const viewport = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    viewport.observe(node)
    const settings = new MutationObserver(sync)
    settings.observe(root, { attributes: true, attributeFilter: ['data-motion', 'data-inspecting'] })
    node.addEventListener('pointerenter', enter)
    node.addEventListener('pointerleave', leave)
    document.addEventListener('visibilitychange', sync)
    return () => {
      viewport.disconnect()
      settings.disconnect()
      node.removeEventListener('pointerenter', enter)
      node.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [stage])

  useLayoutEffect(() => {
    const node = stage.current
    const { index, phase, blocked } = frame
    // Hand CSS ownership to the hydrated phase without hiding the in-flight first pair.
    if (phase !== 'initial') document.documentElement.removeAttribute('data-hero-intro')
    if (!node || blocked || pauseReading) return
    const advance = () => dispatch({ type: 'advance', phase, index })
    if (phase === 'reading') {
      const timer = window.setTimeout(advance, durationMs('--duration-handoff') * 5)
      return () => clearTimeout(timer)
    }
    if (phase === 'docking') return dockBlueprint(node, advance)
    if (phase !== 'entering' && phase !== 'turning') return
    // The second arriving word finishes last. Its CSS clock also follows Slow mode.
    const lastRow = node.querySelector(phase === 'entering'
      ? 'h1 [data-title-plane="first"] [data-ink]:last-child'
      : 'h1 [data-title-plane="in"] [data-ink]:last-child')
    let current = true
    const arrival = lastRow?.getAnimations() ?? []
    void Promise.all(arrival.map(animation => animation.finished)).then(() => {
      if (!current) return
      advance()
    }, () => { /* A hold or motion preference change cancelled this pass. */ })
    return () => { current = false }
  }, [frame, stage, pauseReading])

  return {
    frame,
    hold: () => dispatch({ type: 'hold', incoming: frame.phase === 'turning' && incomingIsLegible(stage.current) }),
    toggle: () => dispatch({ type: 'toggle', incoming: frame.phase === 'turning' && incomingIsLegible(stage.current) }),
  }
}
