'use client'

import { useEffect, type RefObject } from 'react'

/** Records navigation intent and clears a page entrance when keyboard or history takes over. */
export function useRouteInput(page: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = document.documentElement
    const attribute = 'data-route-input'
    const previous = root.getAttribute(attribute)
    const navigation = 'data-route-navigation'
    const previousNavigation = root.getAttribute(navigation)
    const pointerInput = () => {
      root.setAttribute(attribute, 'pointer')
      root.setAttribute(navigation, 'direct')
    }
    const historyInput = () => {
      page.current?.removeAttribute('data-arriving')
      root.setAttribute(navigation, 'history')
      // Browser chrome does not expose its input origin to the document.
      // Preserve keyboard intent until a page pointer event says otherwise.
      if (root.getAttribute(attribute) !== 'keyboard') root.setAttribute(attribute, 'history')
    }
    const keyboardInput = (event: KeyboardEvent) => {
      if (['Alt', 'Control', 'Meta', 'Shift'].includes(event.key)) return
      page.current?.removeAttribute('data-arriving')
      root.setAttribute(attribute, 'keyboard')
      root.setAttribute(navigation, 'direct')
    }

    document.addEventListener('pointerdown', pointerInput, { capture: true, passive: true })
    document.addEventListener('keydown', keyboardInput, { capture: true, passive: true })
    window.addEventListener('popstate', historyInput, { capture: true, passive: true })
    return () => {
      document.removeEventListener('pointerdown', pointerInput, true)
      document.removeEventListener('keydown', keyboardInput, true)
      window.removeEventListener('popstate', historyInput, true)
      if (previous === null) root.removeAttribute(attribute)
      else root.setAttribute(attribute, previous)
      if (previousNavigation === null) root.removeAttribute(navigation)
      else root.setAttribute(navigation, previousNavigation)
    }
  }, [page])
}
