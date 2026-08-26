import { create } from 'zustand'
import { trackTerminalTransition } from '@/lib/analytics'

interface TransitionState {
  isTransitioning: boolean
  targetRoute: string | null
  targetHref: string | null
  transitionKey: number
  startTransition: (route: string, onNavigate: () => void, href?: string) => void
  completeTransition: (key?: number) => void
}

export const useTransitionStore = create<TransitionState>((set, get) => ({
  isTransitioning: false,
  targetRoute: null,
  targetHref: null,
  transitionKey: 0,

  startTransition: (route, onNavigate, href) => {
    const transitionKey = get().transitionKey + 1
    set({
      isTransitioning: true,
      targetRoute: route,
      targetHref: href ?? route,
      transitionKey,
    })
    trackTerminalTransition({ phase: 'start', route, transitionKey })
    trackTerminalTransition({ phase: 'navigate', route, transitionKey })

    // Navigation starts synchronously; presentation never controls when a route opens.
    try {
      onNavigate()
    } catch (error) {
      get().completeTransition(transitionKey)
      throw error
    }
  },

  completeTransition: (key) => {
    const { transitionKey, isTransitioning, targetRoute } = get()
    if (!isTransitioning || (key !== undefined && key !== transitionKey)) return

    if (targetRoute) {
      trackTerminalTransition({ phase: 'complete', route: targetRoute, transitionKey })
    }
    set({ isTransitioning: false, targetRoute: null, targetHref: null })
  },
}))
