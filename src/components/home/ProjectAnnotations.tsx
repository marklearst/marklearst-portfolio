'use client'

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import styles from './ProjectAnnotations.module.css'

// All coordinates are pixels in the published Figma plate. Both views sample the same image.
const crop = { x: 590, y: 201, width: 956, height: 595 }
const radius = 135
const magnification = 2.3
const findings = [
  { title: 'Tap target', x: 820, y: 372, note: 'The audit flagged this 18 × 18 px checkbox and called for a larger tap area.' },
  { title: 'Text spacing', x: 1140, y: 462, note: 'Running the audit again updated this note in place.' },
  { title: 'Product note', x: 1352, y: 610, note: 'The team’s existing note about analytics stayed attached to the order button.' },
] as const

type Point = { x: number; y: number }
function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, value))
}

export default function ProjectAnnotations() {
  const id = useId()
  const plate = useRef<HTMLDivElement>(null)
  const art = useRef<SVGSVGElement>(null)
  const detail = useRef<SVGGElement>(null)
  const drag = useRef<{ id: number; start: Point; origin: Point; unitsPerPixel: number; moved: boolean } | null>(null)
  const canvasPress = useRef<{ id: number; x: number; y: number } | null>(null)
  const suppressClick = useRef(false)
  const [selected, setSelected] = useState(0)
  const [exploring, setExploring] = useState(false)
  const free = useRef<Point | null>(null)
  const finding = findings[selected]
  const stop = { x: finding.x - crop.x, y: finding.y - crop.y }

  function choose(index: number) {
    free.current = null
    plate.current?.style.removeProperty('--free-x')
    plate.current?.style.removeProperty('--free-y')
    setSelected(index)
    setExploring(false)
  }

  function pan(x: number, y: number) {
    const margin = radius / magnification
    const next = { x: clamp(x, margin, crop.width - margin), y: clamp(y, margin, crop.height - margin) }
    if (!free.current) setExploring(true)
    free.current = next
    plate.current!.style.setProperty('--free-x', String(next.x))
    plate.current!.style.setProperty('--free-y', String(next.y))
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0 || document.documentElement.hasAttribute('data-inspecting')) return
    suppressClick.current = false
    // Grabbing a travelling lens takes over at the pixels currently under the glass.
    const matrix = new DOMMatrix(getComputedStyle(detail.current!).transform)
    const origin = { x: -matrix.e / magnification, y: -matrix.f / magnification }
    const unitsPerPixel = crop.width / art.current!.getBoundingClientRect().width
    drag.current = { id: event.pointerId, start: { x: event.clientX, y: event.clientY }, origin, unitsPerPixel, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const session = drag.current
    if (!session || event.pointerId !== session.id) return
    const dx = event.clientX - session.start.x
    const dy = event.clientY - session.start.y
    if (!session.moved && Math.hypot(dx, dy) < 4) return
    session.moved = true
    suppressClick.current = true
    pan(session.origin.x + dx * session.unitsPerPixel, session.origin.y + dy * session.unitsPerPixel)
  }

  function pointAt(event: PointerEvent<SVGSVGElement>) {
    const press = canvasPress.current
    canvasPress.current = null
    if (!press || press.id !== event.pointerId || Math.hypot(event.clientX - press.x, event.clientY - press.y) > 4) return
    if (document.documentElement.hasAttribute('data-inspecting')) return
    // Touch browsers can send the compatibility click to the lens after it moves under the finger.
    suppressClick.current = true
    const bounds = event.currentTarget.getBoundingClientRect()
    pan((event.clientX - bounds.left) * crop.width / bounds.width, (event.clientY - bounds.top) * crop.height / bounds.height)
  }

  function keyPan(event: KeyboardEvent<HTMLButtonElement>) {
    const delta = event.shiftKey ? 60 : 12
    const offsets: Record<string, Point> = { ArrowLeft: { x: -delta, y: 0 }, ArrowRight: { x: delta, y: 0 }, ArrowUp: { x: 0, y: -delta }, ArrowDown: { x: 0, y: delta } }
    if (event.key === 'Home') {
      event.preventDefault()
      choose(0)
    } else if (offsets[event.key]) {
      event.preventDefault()
      const point = free.current ?? stop
      pan(point.x + offsets[event.key].x, point.y + offsets[event.key].y)
    }
  }

  const style = {
    '--magnification': magnification,
    '--stop-x': stop.x, '--stop-y': stop.y, '--radius': radius,
    '--plate-width': crop.width, '--plate-height': crop.height,
  } as CSSProperties

  return (
    <div className={styles.study} data-inspect='Figma annotation study'>
      <div ref={plate} className={styles.plate} style={style} data-free={exploring ? '' : undefined}>
        <svg ref={art} className={styles.art} viewBox={`0 0 ${crop.width} ${crop.height}`} role='img' aria-label='Original annotated checkout from Figma. Two audit findings sit beside an existing product note.'
          onPointerDown={event => {
            if (event.isPrimary && event.button === 0) canvasPress.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
          }}
          onPointerUp={pointAt} onPointerCancel={() => { canvasPress.current = null }}>
          <defs>
            <image id={id + '-plate'} href='/images/a11y-companion-v3-annotations.jpg' x={-crop.x} y={-crop.y} width='1600' height='900' />
            <clipPath id={id + '-lens'}><circle r={radius} /></clipPath>
          </defs>
          <use href={'#' + id + '-plate'} />
          <g className={styles.glass}>
            <g clipPath={`url(#${id}-lens)`}>
              <circle r={radius} className={styles.paper} />
              <g className={styles.detail} ref={detail}>
                <use href={'#' + id + '-plate'} />
                <g className={styles.dimension} transform={`translate(${findings[0].x - crop.x} ${findings[0].y - crop.y})`} aria-hidden='true'>
                  <path d='M-8 12v6m0-3h16m0-3v6' />
                  <text y='32' textAnchor='middle'>18 × 18 px</text>
                </g>
              </g>
            </g>
            <circle r={radius} className={styles.rim} vectorEffect='non-scaling-stroke' />
            <path className={styles.sight} d={`M0 ${-radius}v10 M${radius} 0h-10 M0 ${radius}v-10 M${-radius} 0h10`} vectorEffect='non-scaling-stroke' />
          </g>
        </svg>
        <button type='button' className={styles.grip} aria-label='Magnifier. Activate for the next annotation' aria-describedby={id + '-help'}
          onPointerDown={startDrag} onPointerMove={moveDrag}
          onLostPointerCapture={() => { drag.current = null }}
          onKeyDown={keyPan}
          onClick={event => {
            if (document.documentElement.hasAttribute('data-inspecting')) return
            if (event.detail === 0 || !suppressClick.current) choose((selected + 1) % findings.length)
            suppressClick.current = false
          }} />
      </div>
      <span id={id + '-help'} className='sr-only'>Drag the lens, tap the canvas, or use the arrow keys to explore. Home returns to the first annotation.</span>
      <div className={styles.stops} role='group' aria-label='Magnify an annotation'>
        {findings.map((entry, index) => (
          <button key={entry.title} type='button' aria-pressed={!exploring && selected === index} onClick={() => choose(index)}>{entry.title}</button>
        ))}
      </div>
      <p className={styles.note} aria-live='polite'><span key={exploring ? 'free' : selected}>{exploring ? 'Exploring the original canvas. Choose a note to return to its finding.' : finding.note}</span></p>
    </div>
  )
}
