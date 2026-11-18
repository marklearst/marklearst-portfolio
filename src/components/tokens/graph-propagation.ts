import { animate } from 'motion/mini'
import { durationMs, motionEase } from '@/lib/motion-tokens'
import type { TracePropagation } from '@/lib/inspector/trace-propagation'

export function createGraphPropagation(host: HTMLElement) {
  type SavedStyle = { element: HTMLElement | SVGPathElement; property: string; value: string; priority: string }
  let active: { signature: string; animations: ReturnType<typeof animate>[]; styles: SavedStyle[] } | undefined

  const cancel = () => {
    const run = active
    active = undefined
    run?.animations.forEach(animation => animation.cancel())
    run?.styles.forEach(({ element, property, value, priority }) => {
      if (value) element.style.setProperty(property, value, priority)
      else element.style.removeProperty(property)
    })
    delete host.dataset.propagating
  }

  const play = ({ depths, edges }: TracePropagation) => {
    const causal = durationMs('--semantic-duration-causal') / 1000
    const reveal = durationMs('--semantic-duration-reveal') / 1000
    if (!depths.size || !causal || !reveal || !host.getClientRects().length) return
    const bounds = host.getBoundingClientRect()
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return
    const paths = [...host.querySelectorAll<SVGPathElement>('path[data-propagation]')].filter(path =>
      edges.some(edge => edge.from === path.dataset.from && edge.to === path.dataset.to))
    const signature = JSON.stringify([[...depths], paths.map(path => path.getAttribute('d'))])
    if (active?.signature === signature) return
    cancel()
    const run = { signature, animations: [] as ReturnType<typeof animate>[], styles: [] as SavedStyle[] }
    const save = (element: HTMLElement | SVGPathElement, properties: string[]) => {
      for (const property of properties) run.styles.push({ element, property, value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property) })
    }
    const linear = motionEase('--semantic-easing-linear')
    const enter = motionEase()
    active = run
    host.dataset.propagating = ''
    try {
      for (const path of paths) {
        save(path, ['stroke-dashoffset', 'opacity'])
        run.animations.push(animate(path, { strokeDashoffset: [0, -1], opacity: [0, 1, 1, 0] }, {
          duration: causal,
          delay: (depths.get(path.dataset.from!) ?? 0) * causal,
          ease: linear,
        }))
      }
      for (const node of host.querySelectorAll<HTMLElement>('[data-trace-node]')) {
        const depth = depths.get(node.dataset.traceNode!)
        const value = node.querySelector<HTMLElement>('[data-trace-value]')
        if (depth === undefined || !value) continue
        save(value, ['transform'])
        run.animations.push(animate(value, {
          transform: ['translateY(0)', 'translateY(calc(var(--space-1) * -1))', 'translateY(0)'],
        }, { duration: reveal, delay: depth * causal, ease: enter }))
      }
    } catch {
      cancel()
    }
    const finish = () => { if (active === run) cancel() }
    void Promise.all(run.animations).then(finish, finish)
  }

  return { play, cancel }
}
