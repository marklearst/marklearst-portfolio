'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EffectsState {
  orbsVisible: boolean
  neuralTextVisible: boolean
  homeNeuralState: boolean
  toggleOrbs: () => void
  toggleNeuralText: () => void
  setOrbsVisible: (visible: boolean) => void
  setNeuralTextVisible: (visible: boolean) => void
  setHomeNeuralState: (visible: boolean) => void
}

export const useEffectsStore = create<EffectsState>()(
  persist(
    (set) => ({
      orbsVisible: true,
      neuralTextVisible: true,
      homeNeuralState: true,
      toggleOrbs: () => set((state) => ({ orbsVisible: !state.orbsVisible })),
      toggleNeuralText: () =>
        set((state) => ({ neuralTextVisible: !state.neuralTextVisible })),
      setOrbsVisible: (visible) => set({ orbsVisible: visible }),
      setNeuralTextVisible: (visible) => set({ neuralTextVisible: visible }),
      setHomeNeuralState: (visible) => set({ homeNeuralState: visible }),
    }),
    {
      name: 'effects-preference',
    },
  ),
)

// Backwards compatible export
export const useCursorOrbsStore = () => {
  const store = useEffectsStore()
  return {
    isVisible: store.orbsVisible,
    toggleVisibility: store.toggleOrbs,
    setVisibility: store.setOrbsVisible,
  }
}
