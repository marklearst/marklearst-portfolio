import { animate } from 'motion/mini'
import { durationMs, motionEase } from './motion-tokens'

export function playMotionPreview(element: HTMLElement, distance: number, duration: `--${string}`, ease: `--${string}`) {
  return animate(element, { transform: ['translateX(0px)', `translateX(${distance}px)`] }, {
    duration: durationMs(duration) / 1000,
    ease: motionEase(ease),
  })
}
