'use client'

import { useState, useCallback, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

export function useTextScramble(originalText: string, duration: number = 800) {
  const [displayText, setDisplayText] = useState(originalText)
  const [isScrambling, setIsScrambling] = useState(false)
  const animationRef = useRef<number | null>(null)
  const frameRef = useRef(0)

  const scramble = useCallback(() => {
    if (isScrambling) return

    setIsScrambling(true)
    frameRef.current = 0

    const totalFrames = Math.floor(duration / 16) // ~60fps

    const animate = () => {
      frameRef.current++

      const progress = frameRef.current / totalFrames
      const revealedChars = Math.floor(progress * originalText.length * 1.5)

      let result = ''
      for (let i = 0; i < originalText.length; i++) {
        if (originalText[i] === ' ') {
          result += ' '
        } else if (i < revealedChars) {
          result += originalText[i]
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)]
        }
      }

      setDisplayText(result)

      if (frameRef.current < totalFrames) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayText(originalText)
        setIsScrambling(false)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [originalText, duration, isScrambling])

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setDisplayText(originalText)
    setIsScrambling(false)
  }, [originalText])

  return { displayText, scramble, reset, isScrambling }
}
