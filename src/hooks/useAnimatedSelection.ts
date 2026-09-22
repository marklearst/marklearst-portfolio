'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const EXIT_MS = 100

/** Feedback is immediate. Outgoing id exits with a short blur window; spam interrupts cleanly. */
export function useAnimatedSelection<T extends string>(initialValue: T) {
  const [selection, setSelection] = useState({ value: initialValue, motion: false })
  const [exitingId, setExitingId] = useState<T | null>(null)
  const exitTimer = useRef<number | null>(null)

  const stopExit = useCallback(() => {
    if (exitTimer.current !== null) {
      window.clearTimeout(exitTimer.current)
      exitTimer.current = null
    }
    setExitingId(null)
  }, [])

  function select(value: T, pointer: boolean) {
    if (value === selection.value) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const motion = pointer && !reduced

    stopExit()
    if (motion) {
      setExitingId(selection.value)
      exitTimer.current = window.setTimeout(() => {
        exitTimer.current = null
        setExitingId(null)
      }, EXIT_MS)
    }

    setSelection({ value, motion })
  }

  useEffect(() => () => stopExit(), [stopExit])

  return { ...selection, exitingId, select }
}
