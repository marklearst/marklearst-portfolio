'use client'

import { useState, useEffect, useRef } from 'react'

export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0)
  const lastScrollY = useRef(0)
  const lastTime = useRef(0)
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    let currentVelocity = 0
    lastTime.current = Date.now()
    lastScrollY.current = window.scrollY

    const updateVelocity = () => {
      const now = Date.now()
      const deltaTime = now - lastTime.current
      const deltaScroll = Math.abs(window.scrollY - lastScrollY.current)

      if (deltaTime > 0) {
        // Calculate velocity (pixels per millisecond)
        const instantVelocity = deltaScroll / deltaTime

        // Smooth the velocity with lerp
        currentVelocity = currentVelocity + (instantVelocity - currentVelocity) * 0.1

        // Clamp between 0 and 1 for usability
        const normalizedVelocity = Math.min(currentVelocity * 10, 1)

        setVelocity(normalizedVelocity)
      }

      lastScrollY.current = window.scrollY
      lastTime.current = now

      rafId.current = requestAnimationFrame(updateVelocity)
    }

    rafId.current = requestAnimationFrame(updateVelocity)

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])

  return velocity
}
