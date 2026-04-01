import { create } from 'zustand'

type TransitionPhase = 'idle' | 'animating' | 'navigating'

interface TransitionState {
  isTransitioning: boolean
  phase: TransitionPhase
  targetRoute: string | null
  onNavigate: (() => void) | null
  transitionKey: number
  startTransition: (route: string, onNavigate: () => void) => void
  completeTransition: (key?: number) => void
  triggerNavigation: (key?: number) => void
}

export const useTransitionStore = create<TransitionState>((set, get) => ({
  isTransitioning: false,
  phase: 'idle',
  targetRoute: null,
  onNavigate: null,
  transitionKey: 0,

  startTransition: (route: string, onNavigate: () => void) => {
    set((state) => {
      const nextKey = state.transitionKey + 1
      if (process.env.NODE_ENV === 'development') {
        console.log('[transition]', {
          event: 'start',
          key: nextKey,
          route,
        })
      }
      return {
        isTransitioning: true,
        phase: 'animating',
        targetRoute: route,
        onNavigate,
        transitionKey: nextKey,
      }
    })
  },

  triggerNavigation: (key) => {
    const { onNavigate, transitionKey, phase } = get()
    if (key && key !== transitionKey) return
    if (!onNavigate || phase === 'navigating') return
    if (process.env.NODE_ENV === 'development') {
      console.log('[transition]', {
        event: 'navigate',
        key: transitionKey,
      })
    }
    set({ phase: 'navigating' })
    onNavigate()
  },

  completeTransition: (key) => {
    const { transitionKey, isTransitioning } = get()
    if (!isTransitioning) return
    if (key && key !== transitionKey) return
    if (process.env.NODE_ENV === 'development') {
      console.log('[transition]', {
        event: 'complete',
        key: transitionKey,
      })
    }
    set({
      isTransitioning: false,
      phase: 'idle',
      targetRoute: null,
      onNavigate: null,
    })
  },
}))
