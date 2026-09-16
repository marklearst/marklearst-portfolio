'use client'

import { useEffect } from 'react'

/** Records input origin without changing navigation, focus, or scroll. */
export function useRouteInput() {
  useEffect(() => {
    const root = document.documentElement
    const attribute = 'data-route-input'
    const previous = root.getAttribute(attribute)
    const pointerInput = () => root.setAttribute(attribute, 'pointer')
    const historyInput = () => {
      // Browser chrome does not expose its input origin to the document.
      // Preserve keyboard intent until a page pointer event says otherwise.
      if (root.getAttribute(attribute) !== 'keyboard') root.setAttribute(attribute, 'history')
    }
    const keyboardInput = (event: KeyboardEvent) => {
      if (['Alt', 'Control', 'Meta', 'Shift'].includes(event.key)) return
      root.setAttribute(attribute, 'keyboard')
    }

    document.addEventListener('pointerdown', pointerInput, { capture: true, passive: true })
    document.addEventListener('keydown', keyboardInput, { capture: true, passive: true })
    window.addEventListener('popstate', historyInput, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', pointerInput, true)
      document.removeEventListener('keydown', keyboardInput, true)
      window.removeEventListener('popstate', historyInput)
      if (previous === null) root.removeAttribute(attribute)
      else root.setAttribute(attribute, previous)
    }
  }, [])
}
