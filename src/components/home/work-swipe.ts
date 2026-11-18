import { durationMs, easing } from '@/lib/motion-tokens'
import { swipeDestination } from './work-swipe-intent'

interface Gesture {
  pointer: number
  x: number
  y: number
  lastX: number
  lastTime: number
  velocity: number
  offset: number
  width: number
  index: number
  locked: boolean
}

/** The preview owns horizontal movement; the browser keeps vertical scrolling. */
export function attachWorkSwipe(stage: HTMLElement, select: (id: string) => void) {
  const panels = [...stage.querySelectorAll<HTMLElement>('[data-work-project]')]
  let gesture: Gesture | undefined
  let animations: Animation[] = []
  let suppressClick = false
  let generation = 0
  const savedTransforms = new Map<HTMLElement, { value: string; priority: string }>()

  function clear() {
    generation++
    for (const animation of animations) animation.cancel()
    animations = []
    const pointer = gesture?.pointer
    gesture = undefined
    if (pointer !== undefined && stage.hasPointerCapture(pointer)) stage.releasePointerCapture(pointer)
    delete stage.dataset.swiping
    for (const panel of panels) {
      delete panel.dataset.swipeVisible
      const previous = savedTransforms.get(panel)
      if (previous?.value) panel.style.setProperty('transform', previous.value, previous.priority)
      else if (previous) panel.style.removeProperty('transform')
    }
    savedTransforms.clear()
  }

  function position(current: Gesture, offset: number) {
    current.offset = offset
    for (let i = 0; i < panels.length; i++) {
      const distance = i - current.index
      if (Math.abs(distance) > 1) continue
      if (!savedTransforms.has(panels[i])) savedTransforms.set(panels[i], {
        value: panels[i].style.getPropertyValue('transform'), priority: panels[i].style.getPropertyPriority('transform'),
      })
      panels[i].dataset.swipeVisible = ''
      panels[i].style.transform = `translateX(${distance * current.width + offset}px)`
    }
  }

  function down(event: PointerEvent) {
    suppressClick = false
    if (!event.isPrimary || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
    if (!(event.target instanceof Element) || !event.target.closest('[data-work-preview]')) return
    if (document.documentElement.hasAttribute('data-inspecting')) return
    clear()
    const index = panels.findIndex(panel => panel.dataset.active === 'true')
    if (index < 0) return
    gesture = {
      pointer: event.pointerId, x: event.clientX, y: event.clientY,
      lastX: event.clientX, lastTime: event.timeStamp, velocity: 0, offset: 0,
      width: stage.getBoundingClientRect().width, index, locked: false,
    }
  }

  function move(event: PointerEvent) {
    const current = gesture
    if (!current || current.pointer !== event.pointerId) return
    const x = event.clientX - current.x
    const y = event.clientY - current.y
    if (!current.locked) {
      if (Math.max(Math.abs(x), Math.abs(y)) < 8) return
      if (Math.abs(y) >= Math.abs(x)) { suppressClick = true; clear(); return }
      current.locked = true
      suppressClick = true
      stage.dataset.swiping = ''
      stage.setPointerCapture(event.pointerId)
    }
    event.preventDefault()
    const elapsed = event.timeStamp - current.lastTime
    if (elapsed > 0) current.velocity = (event.clientX - current.lastX) / elapsed
    current.lastX = event.clientX
    current.lastTime = event.timeStamp
    const beyondEdge = (current.index === 0 && x > 0) || (current.index === panels.length - 1 && x < 0)
    const offset = beyondEdge ? Math.sign(x) * Math.sqrt(Math.abs(x)) * 2 : Math.max(-current.width, Math.min(current.width, x))
    position(current, offset)
  }

  function up(event: PointerEvent) {
    const current = gesture
    if (!current || current.pointer !== event.pointerId) return
    if (!current.locked) { clear(); return }
    const next = swipeDestination(current.index, panels.length, current.width, current.offset, current.velocity, event.timeStamp - current.lastTime)
    const destination = (current.index - next) * current.width
    const duration = durationMs('--semantic-duration-handoff')
    gesture = undefined
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId)
    if (next !== current.index) select(panels[next].dataset.workProject!)
    if (!duration) { clear(); return }
    const run = ++generation
    const curve = easing()
    for (let i = 0; i < panels.length; i++) {
      if (!panels[i].hasAttribute('data-swipe-visible')) continue
      const distance = (i - current.index) * current.width
      animations.push(panels[i].animate({
        transform: [`translateX(${distance + current.offset}px)`, `translateX(${distance + destination}px)`],
      }, { duration, easing: curve, fill: 'both' }))
    }
    void Promise.all(animations.map(animation => animation.finished)).then(() => { if (generation === run) clear() }, () => {})
  }

  function click(event: MouseEvent) {
    if (!suppressClick || event.detail === 0) return
    suppressClick = false
    event.preventDefault()
    event.stopPropagation()
  }
  function cancelPointer(event: PointerEvent) { if (gesture?.pointer === event.pointerId) clear() }
  function lostCapture(event: PointerEvent) { if (event.target === stage) cancelPointer(event) }
  function preventNativeDrag(event: DragEvent) { event.preventDefault() }
  const context = new MutationObserver(clear)
  context.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion', 'data-inspecting'] })
  stage.addEventListener('pointerdown', down)
  window.addEventListener('pointermove', move, { passive: false })
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', cancelPointer)
  stage.addEventListener('lostpointercapture', lostCapture)
  stage.addEventListener('click', click, true)
  stage.addEventListener('dragstart', preventNativeDrag)
  window.addEventListener('keydown', clear, true)
  window.addEventListener('resize', clear)
  window.addEventListener('blur', clear)
  function destroy() {
    clear()
    context.disconnect()
    stage.removeEventListener('pointerdown', down)
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', cancelPointer)
    stage.removeEventListener('lostpointercapture', lostCapture)
    stage.removeEventListener('click', click, true)
    stage.removeEventListener('dragstart', preventNativeDrag)
    window.removeEventListener('keydown', clear, true)
    window.removeEventListener('resize', clear)
    window.removeEventListener('blur', clear)
  }
  return { cancel: clear, destroy }
}
