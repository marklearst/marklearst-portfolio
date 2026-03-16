import { create } from 'zustand'

interface TransitionState {
  isTransitioning: boolean
  targetRoute: string | null
  onNavigate: (() => void) | null
  startTransition: (route: string, onNavigate: () => void) => void
  completeTransition: () => void
  triggerNavigation: () => void
}

export const useTransitionStore = create<TransitionState>((set, get) => ({
  isTransitioning: false,
  targetRoute: null,
  onNavigate: null,

  startTransition: (route: string, onNavigate: () => void) => {
    set({ isTransitioning: true, targetRoute: route, onNavigate })
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
