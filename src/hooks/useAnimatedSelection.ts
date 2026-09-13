'use client'

import { useRef, useState } from 'react'

/** Feedback is immediate. Only isolated pointer changes receive a short reveal. */
export function useAnimatedSelection<T extends string>(initialValue: T) {
  const [selection, setSelection] = useState({ value: initialValue, motion: false })
  const lastChange = useRef(-Infinity)

  function select(value: T, pointer: boolean) {
    if (value === selection.value) return
    const now = performance.now()
    const motion = pointer && now - lastChange.current > 180 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    lastChange.current = now
    setSelection({ value, motion })
  }

  return { ...selection, select }
}
