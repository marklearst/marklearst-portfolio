import { durationMs, easing } from '@/lib/motion-tokens'
import { RESTING_SPLIT } from './hero-titles'
import styles from './Hero.module.css'

/** The mask and its ink travel in opposite directions, keeping the letters registered. */
export function dockBlueprint(stage: HTMLElement, finish: () => void) {
  const mask = stage.querySelector<HTMLElement>(`.${styles.xray}`)!
  const drawing = stage.querySelector<HTMLElement>(`.${styles.drawing}`)!
  const guide = stage.querySelector<HTMLElement>(`.${styles.seam}`)!
  const range = stage.querySelector<HTMLInputElement>('input[type="range"]')!
  const beat = durationMs('--duration-causal')
  const timing: KeyframeAnimationOptions = {
    delay: beat,
    duration: durationMs('--duration-handoff') + beat,
    easing: easing('--ease-move'),
    fill: 'both',
  }
  const slide = (element: HTMLElement, to: string) => element.animate(
    [{ transform: 'translateX(0)' }, { transform: `translateX(${to})` }], timing,
  )
  const edge = slide(guide, `${RESTING_SPLIT}cqw`)
  const animations = [edge, slide(mask, `${RESTING_SPLIT}%`), slide(drawing, `-${RESTING_SPLIT}%`)]
  const effect = edge.effect!
  let frame: number
  // The native control follows the compositor clock without re-rendering the specimen.
  const syncRange = () => {
    const progress = effect.getComputedTiming().progress ?? 0
    const value = Math.round(100 - RESTING_SPLIT * progress)
    if (range.valueAsNumber !== value) {
      range.valueAsNumber = value
      range.setAttribute('aria-valuetext', `${value}% blueprint`)
    }
    frame = requestAnimationFrame(syncRange)
  }
  frame = requestAnimationFrame(syncRange)
  let active = true
  void edge.finished.then(() => { if (active) finish() }, () => {})
  return () => {
    active = false
    cancelAnimationFrame(frame)
    animations.forEach(animation => animation.cancel())
  }
}
