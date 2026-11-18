import { useId, useRef, type CSSProperties, type PointerEvent } from 'react'
import { useInspector, useInspectorController } from './InspectorProvider'
import styles from './Inspector.module.css'

/** The near half of the left link crosses in front of the right one. Both
 * passes share one path so the overlap stays registered as the links part. */
export default function ColorLink({ source }: { source?: string }) {
  const id = useId()
  const controller = useInspectorController()
  const broken = useInspector((state) => state.broken)
  const gesture = useRef<{
    pointer: number; x: number; y: number; side: number; travel: number; progress: number; dragged: boolean
  } | null>(null)
  const suppressClick = useRef(false)

  function begin(event: PointerEvent<SVGSVGElement>) {
    if (!event.isPrimary || event.button !== 0 || controller.getState().ruleStatus === 'loading') return
    const rect = event.currentTarget.getBoundingClientRect()
    suppressClick.current = false
    gesture.current = {
      pointer: event.pointerId, x: event.clientX, y: event.clientY,
      side: event.clientX < rect.left + rect.width / 2 ? -1 : 1,
      travel: rect.width / 5, progress: Number(broken), dragged: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function move(event: PointerEvent<SVGSVGElement>) {
    const g = gesture.current
    if (!g || g.pointer !== event.pointerId) return
    const dx = event.clientX - g.x
    if (!g.dragged) {
      const dy = event.clientY - g.y
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return
      if (Math.abs(dy) > Math.abs(dx)) {
        finish(event, false)
        return
      }
      g.dragged = true
    }
    g.progress = Math.max(0, Math.min(1, Number(broken) + dx * g.side / g.travel))
    if (controller.getState().motion !== 'reduced') {
      event.currentTarget.dataset.pulling = ''
      event.currentTarget.style.setProperty('--separation', String(g.progress))
    }
  }

  function finish(event: PointerEvent<SVGSVGElement>, commit: boolean) {
    const g = gesture.current
    if (!g || g.pointer !== event.pointerId) return
    gesture.current = null
    suppressClick.current = g.dragged || !commit
    const svg = event.currentTarget
    delete svg.dataset.pulling
    svg.style.removeProperty('--separation')
    if (svg.hasPointerCapture(g.pointer)) svg.releasePointerCapture(g.pointer)
    if (commit && g.dragged && (g.progress >= 0.5) !== broken) void controller.setBroken(!broken)
  }

  return (
    <svg viewBox='0 0 300 140' fill='none' aria-hidden='true' className={styles.colorLink}
      onPointerDown={begin} onPointerMove={move} onPointerUp={(event) => finish(event, true)}
      onPointerCancel={(event) => finish(event, false)} onLostPointerCapture={(event) => finish(event, false)}
      onClickCapture={(event) => {
        if (suppressClick.current) {
          event.stopPropagation()
          suppressClick.current = false
        }
      }}
      style={{ '--link-source': source ?? 'var(--component-button-accent-background)' } as CSSProperties}>
      <defs>
        <rect id={id} x='64' y='46' width='105' height='48' rx='24' />
        <clipPath id={id + '-front'}><rect x='105' y='70' width='72' height='40' /></clipPath>
      </defs>
      <g transform='rotate(-17 150 70)'>
        <g className={styles.sourceLink}><use href={'#' + id} stroke='var(--link-source)' strokeWidth='17' /></g>
        <g className={styles.buttonLink}>
          <g transform='translate(70)'>
            <use href={'#' + id} stroke='var(--component-dock-inset)' strokeWidth='25' />
            <use href={'#' + id} stroke='var(--component-button-accent-background)' strokeWidth='17' />
          </g>
        </g>
        <g className={styles.sourceLink}>
          <g clipPath={'url(#' + id + '-front)'}>
            <use href={'#' + id} stroke='var(--component-dock-inset)' strokeWidth='25' />
            <use href={'#' + id} stroke='var(--link-source)' strokeWidth='17' />
          </g>
        </g>
      </g>
    </svg>
  )
}
