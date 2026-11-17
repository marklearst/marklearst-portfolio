'use client'

import { useId, useLayoutEffect, useRef, type CSSProperties } from 'react'
import TokenPath from '@/components/tokens/TokenPath'
import { CloseIcon } from '@/components/ui/Icon'
import type { Inspection } from '@/lib/inspector/types'
import { useInspector, useInspectorController } from './InspectorProvider'
import styles from './InspectorTrace.module.css'

/** Find one complete reference chain. Prefer the property that identifies this
 * kind of element, then the deepest of the actual chains for that property. */
function traceFor(report: Inspection, element: Element | null) {
  const properties = report.properties.filter(property => property.chains.length)
  const order = element?.matches('h1,h2,h3,h4,h5,h6,p,blockquote')
    ? ['size', 'typeface', 'text'] : element?.matches('section,article,main')
      ? ['padding', 'background'] : ['background', 'fill', 'stroke', 'text']
  const property = order.map(id => properties.find(p => p.id === id)).find(Boolean) ?? properties[0]
  if (!property) return null
  const chain = property.chains.reduce((best, next) => next.steps.length > best.steps.length ? next : best)
  return { property, chain }
}

export default function InspectorTrace({ expand }: { expand: () => void }) {
  const controller = useInspectorController()
  const selection = useInspector(state => state.selection)
  const selectionId = useInspector(state => state.selectionId)
  const animate = useInspector(state => state.animate)
  const pinned = useInspector(state => state.pinned)
  const host = useRef<HTMLElement>(null)
  const measured = useRef<HTMLSpanElement>(null)
  const id = useId()
  const target = controller.inspectedElement()
  const trace = selection && traceFor(selection, target)
  const raw = selection?.properties.find(property => property.raw)
  const description = trace ? [trace.property.label, ...trace.chain.steps.map(step => step.path), trace.chain.value.text].join(', ')
    : raw ? `${raw.label}: ${raw.raw}` : 'No direct token reference.'

  useLayoutEffect(() => {
    const node = host.current
    if (!node || !target) return
    const mq = window.matchMedia('(max-width: 959px)')
    function position() {
      if (!node || !target) return
      const r = target.getBoundingClientRect()
      if (measured.current) {
        const style = getComputedStyle(target)
        measured.current.textContent = trace?.property.id === 'padding' ? style.paddingTop : style.fontSize
      }
      if (mq.matches) {
        node.toggleAttribute('data-above', r.top + Math.min(r.height, innerHeight) / 2 > innerHeight / 2)
        node.style.removeProperty('left')
        node.style.removeProperty('top')
        return
      }
      const w = node.offsetWidth, h = node.offsetHeight
      const gap = Number.parseFloat(getComputedStyle(node).getPropertyValue('--space-4'))
      const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
      const spaceRight = innerWidth - r.right, spaceLeft = r.left
      const beside = Math.max(spaceRight, spaceLeft) >= w + 2 * gap
      const x = beside ? (spaceRight >= spaceLeft ? r.right + gap : r.left - w - gap) : r.left
      const y = beside ? r.top : (r.bottom + h + gap <= innerHeight ? r.bottom + gap : r.top - h - gap)
      node.style.left = Math.max(gap, Math.min(x, innerWidth - w - gap)) + 'px'
      node.style.top = Math.max(header + gap, Math.min(y, innerHeight - h - gap)) + 'px'
    }
    position()
    const observer = new ResizeObserver(position)
    observer.observe(target)
    observer.observe(node)
    window.addEventListener('resize', position)
    window.addEventListener('scroll', position, {capture: true, passive: true})
    const addDescription = !target.getAttribute('aria-describedby')?.split(/\s+/).includes(id)
    if (addDescription) target.setAttribute('aria-describedby', [target.getAttribute('aria-describedby'), id].filter(Boolean).join(' '))
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', position)
      window.removeEventListener('scroll', position, true)
      if (addDescription) {
        const rest = target.getAttribute('aria-describedby')?.split(/\s+/).filter(value => value !== id).join(' ')
        if (rest) target.setAttribute('aria-describedby', rest)
        else target.removeAttribute('aria-describedby')
      }
    }
  }, [target, selectionId, id, trace?.property.id])

  if (!selection || !target) return null
  return (
    <aside ref={host} className={styles.reader} data-inspector-ui='' data-inspector-dock='trace' aria-label='Design token trace'>
      <header className={styles.top}>
        <div>
          <h2>{selection.label}</h2>
          <p>{trace?.property.label ?? raw?.label ?? 'Style'}{(trace?.property.id === 'size' || trace?.property.id === 'padding') && <> · <span ref={measured} /> on this screen</>}{trace && trace.property.chains.length > 1 ? ' · One input' : ''}{pinned ? ' · Pinned' : ''}</p>
        </div>
        <button type='button' aria-label='Stop inspecting' onClick={() => void controller.setInspecting(false)}><CloseIcon size={16} /></button>
      </header>
      <span id={id} className={styles.srOnly}>{description}</span>
      {trace ? (
        <ol key={selectionId} className={styles.path} data-animate={animate || undefined}>
          {trace.chain.steps.map((step, index) => (
            <li key={step.path} style={{'--step': index} as CSSProperties}>
              <span>{step.layer}{step.context ? ` · ${step.context}` : ''}</span>
              <code><TokenPath path={step.path} /></code>
            </li>
          ))}
          <li className={styles.value} style={{'--step': trace.chain.steps.length} as CSSProperties}>
            {trace.chain.value.kind === 'color' && <i aria-hidden='true' style={{background:trace.chain.value.css}} />}
            <code>{trace.chain.value.text}</code>
          </li>
        </ol>
      ) : <p className={styles.empty}>{raw ? <>Raw value <code>{raw.raw}</code></> : 'No direct token reference.'}</p>}
      <button type='button' data-trace-details='' className={styles.more} onClick={expand}>All properties <span aria-hidden='true'>→</span></button>
    </aside>
  )
}
