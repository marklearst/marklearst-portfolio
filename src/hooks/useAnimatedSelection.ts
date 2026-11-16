'use client'

import { useRef, useState } from 'react'
import { durationMs } from '@/lib/motion-tokens'

/** Feedback is immediate. Only isolated pointer changes receive a short reveal. */
export function useAnimatedSelection<T extends string>(initialValue: T) {
  const [selection, setSelection] = useState({ value: initialValue, motion: false })
  const lastChange = useRef(-Infinity)

  function select(value: T, pointer: boolean) {
    if (value === selection.value) return
    const now = performance.now()
    // Zero under reduced motion, which leaves nothing to reveal.
    const reveal = durationMs('--semantic-duration-reveal')
    const motion = pointer && reveal > 0 && now - lastChange.current > reveal
    lastChange.current = now
    setSelection({ value, motion })
  }

  return { ...selection, select }
}
