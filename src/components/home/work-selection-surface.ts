import { durationMs, easing } from '@/lib/motion-tokens'

export function attachWorkSelectionSurface(list: HTMLElement, surface: HTMLElement) {
  let target: HTMLElement | undefined
  let animation: Animation | undefined
  let ready = false

  function moveTo(next: HTMLElement, animate: boolean) {
    const bounds = list.getBoundingClientRect()
    const box = next.getBoundingClientRect()
    const radius = getComputedStyle(next).borderRadius
    const to = {
      transform: `translate(${box.left - bounds.left}px, ${box.top - bounds.top}px)`,
      clipPath: `inset(0px 0px ${Math.max(0, bounds.height - box.height)}px 0px round ${radius})`,
    }
    const visible = box.bottom > 0 && box.top < window.innerHeight
    const duration = ready && animate && visible && !document.documentElement.hasAttribute('data-inspecting')
      ? durationMs('--semantic-duration-handoff') : 0
    const previous = duration > 0 ? getComputedStyle(surface) : undefined
    const from = previous ? { transform: previous.transform, clipPath: previous.clipPath } : undefined
    const curve = from ? easing('--semantic-easing-enter') : undefined
    target = next
    const outgoing = animation
    animation = undefined
    outgoing?.cancel()
    Object.assign(surface.style, to)
    if (from) {
      const current = surface.animate([from, to], { duration, easing: curve })
      animation = current
      void current.finished.then(() => {
        if (animation !== current) return
        current.cancel()
        animation = undefined
        settle()
      }, () => {})
    }
    ready = true
    list.dataset.selectionReady = ''
  }

  function settle() {
    if (target) moveTo(target, false)
  }

  function focusShape() {
    if (!animation) settle()
  }

  function stopPlayback() {
    if (animation) settle()
  }

  const resize = new ResizeObserver(settle)
  resize.observe(list)
  for (const tab of list.querySelectorAll('[role="tab"]')) resize.observe(tab)
  const context = new MutationObserver(settle)
  context.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion', 'data-theme', 'data-inspecting'] })
  window.addEventListener('keydown', stopPlayback, true)
  window.addEventListener('blur', stopPlayback)
  list.addEventListener('focusin', focusShape)
  list.addEventListener('focusout', focusShape)

  return {
    moveTo,
    destroy() {
      resize.disconnect()
      context.disconnect()
      window.removeEventListener('keydown', stopPlayback, true)
      window.removeEventListener('blur', stopPlayback)
      list.removeEventListener('focusin', focusShape)
      list.removeEventListener('focusout', focusShape)
      const outgoing = animation
      animation = undefined
      target = undefined
      outgoing?.cancel()
      delete list.dataset.selectionReady
      surface.style.removeProperty('transform')
      surface.style.removeProperty('clip-path')
    },
  }
}
