import { create } from 'zustand'

interface TransitionState {
  isTransitioning: boolean
  targetRoute: string | null
  onNavigate: (() => void) | null
  transitionKey: number
  startTransition: (route: string, onNavigate: () => void) => void
  completeTransition: () => void
  triggerNavigation: () => void
}

export const useTransitionStore = create<TransitionState>((set, get) => ({
  isTransitioning: false,
  targetRoute: null,
  onNavigate: null,
  transitionKey: 0,

  startTransition: (route: string, onNavigate: () => void) => {
    set((state) => ({
      isTransitioning: true,
      targetRoute: route,
      onNavigate,
      transitionKey: state.transitionKey + 1,
    }))
  },

  triggerNavigation: () => {
    const { onNavigate } = get()
    if (onNavigate) {
      onNavigate()
    }
  },

  completeTransition: () => {
    set({ isTransitioning: false, targetRoute: null, onNavigate: null })
  },
}))
