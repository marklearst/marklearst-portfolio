import { animate } from 'motion/mini'
import { durationMs, motionEase } from '../motion-tokens'

type DockFrames = { transform?: string[]; opacity?: number[] }

const active = new WeakMap<HTMLElement, () => void>()

export function stopDockMotion(dock: HTMLElement) {
  active.get(dock)?.()
}

/** Motion commits final styles; a handoff must give those properties back to the dock. */
export function animateDock(dock: HTMLElement, frames: DockFrames, token: `--${string}`) {
  stopDockMotion(dock)
  const duration = durationMs(token) / 1000
  if (!duration) return
  const saved = { transform: dock.style.transform, opacity: dock.style.opacity }
  const animation = animate(dock, frames, { duration, ease: motionEase() })
  const restore = () => {
    if (active.get(dock) !== restore) return
    active.delete(dock)
    animation.cancel()
    if (frames.transform) dock.style.transform = saved.transform
    if (frames.opacity) dock.style.opacity = saved.opacity
  }
  active.set(dock, restore)
  void animation.then(restore)
}
