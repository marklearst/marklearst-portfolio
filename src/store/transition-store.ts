import { create } from 'zustand'
import { trackTerminalTransition } from '@/lib/analytics'

type TransitionPhase = 'idle' | 'animating' | 'navigating'

interface TransitionState {
  isTransitioning: boolean
  phase: TransitionPhase
  targetRoute: string | null
  targetHref: string | null
  onNavigate: (() => void) | null
  transitionKey: number
  startTransition: (
    route: string,
    onNavigate: () => void,
    href?: string,
  ) => void
  completeTransition: (key?: number) => void
  triggerNavigation: (key?: number) => void
}

export const useTransitionStore = create<TransitionState>((set, get) => ({
  isTransitioning: false,
  phase: 'idle',
  targetRoute: null,
  targetHref: null,
  onNavigate: null,
  transitionKey: 0,

  startTransition: (route: string, onNavigate: () => void, href?: string) => {
    set((state) => {
      const nextKey = state.transitionKey + 1
      if (process.env.NODE_ENV === 'development') {
        console.log('[transition]', {
          event: 'start',
          key: nextKey,
          route,
        })
      }
      trackTerminalTransition({
        event: 'start',
        route,
        transitionKey: nextKey,
      })
      return {
        isTransitioning: true,
        phase: 'animating',
        targetRoute: route,
        targetHref: href ?? route,
        onNavigate,
        transitionKey: nextKey,
      }
    })
  },

  triggerNavigation: (key) => {
    const { onNavigate, transitionKey, phase, targetRoute } = get()
    if (key && key !== transitionKey) return
    if (!onNavigate || phase === 'navigating') return
    if (process.env.NODE_ENV === 'development') {
      console.log('[transition]', {
        event: 'navigate',
        key: transitionKey,
      })
    }
    if (targetRoute) {
      trackTerminalTransition({
        event: 'navigate',
        route: targetRoute,
        transitionKey,
      })
    }
    set({ phase: 'navigating' })
    onNavigate()
  },

  completeTransition: (key) => {
    const { transitionKey, isTransitioning, targetRoute } = get()
    if (!isTransitioning) return
    if (key && key !== transitionKey) return
    if (process.env.NODE_ENV === 'development') {
      console.log('[transition]', {
        event: 'complete',
        key: transitionKey,
      })
    }
    if (targetRoute) {
      trackTerminalTransition({
        event: 'complete',
        route: targetRoute,
        transitionKey,
      })
    }
    set({
      isTransitioning: false,
      phase: 'idle',
      targetRoute: null,
      targetHref: null,
      onNavigate: null,
    })
  },
}))
