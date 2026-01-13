'use client'

import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { MONOKAI } from '@/lib/monokai-colors'
import { trackKonamiCode } from '@/lib/analytics'

// Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
]

export default function KonamiCode() {
  const [activated, setActivated] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const inputRef = useRef<string[]>([])
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      inputRef.current.push(e.code)

      // Keep only last 10 keys
      if (inputRef.current.length > 10) {
        inputRef.current.shift()
      }

      // Check if Konami code was entered
      if (inputRef.current.join(',') === KONAMI_CODE.join(',')) {
        setActivated(true)
        setShowMessage(true)
        inputRef.current = []
        trackKonamiCode()

        // Hide message after 4 seconds
        setTimeout(() => {
          setShowMessage(false)
        }, 4000)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Particle explosion effect when activated
  useEffect(() => {
    if (!activated || !particlesRef.current) return

    const colors = [
      MONOKAI.pink,
      MONOKAI.orange,
      MONOKAI.yellow,
      MONOKAI.green,
      MONOKAI.cyan,
      MONOKAI.purple,
    ]

    // Create particle explosion
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div')
      particle.style.position = 'fixed'
      particle.style.width = '8px'
      particle.style.height = '8px'
      particle.style.borderRadius = '50%'
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)]
      particle.style.left = '50%'
      particle.style.top = '50%'
      particle.style.pointerEvents = 'none'
      particle.style.zIndex = '10000'
      particlesRef.current.appendChild(particle)

      const angle = (Math.PI * 2 * i) / 50
      const velocity = 200 + Math.random() * 300
      const destX = Math.cos(angle) * velocity
      const destY = Math.sin(angle) * velocity

      gsap.to(particle, {
        x: destX,
        y: destY,
        opacity: 0,
        scale: 0,
        duration: 1 + Math.random() * 0.5,
        ease: 'power2.out',
        onComplete: () => {
          particle.remove()
        },
      })
    }
  }, [activated])

  return (
    <>
      <div
        ref={particlesRef}
        className='fixed inset-0 pointer-events-none z-10000'
      />

      {showMessage && (
        <div className='fixed inset-0 flex items-center justify-center pointer-events-none z-9999 animate-konami-fade'>
          <div
            className='px-8 py-6 rounded-2xl font-mono text-center'
            style={{
              background: `linear-gradient(135deg, ${MONOKAI.background}ee, ${MONOKAI.background}dd)`,
              border: `2px solid ${MONOKAI.cyan}40`,
              boxShadow: `0 0 60px ${MONOKAI.cyan}20`,
            }}
          >
            <div
              className='text-2xl mb-2 font-bold'
              style={{
                background: `linear-gradient(90deg, ${MONOKAI.pink}, ${MONOKAI.cyan}, ${MONOKAI.purple})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Achievement Unlocked!
            </div>
            <div
              className='text-sm'
              style={{ color: `${MONOKAI.foreground}99` }}
            >
              You found the easter egg. You're definitely a dev.
            </div>
            <div
              className='text-xs mt-3'
              style={{ color: `${MONOKAI.foreground}60` }}
            >
              ↑ ↑ ↓ ↓ ← → ← → B A
            </div>
          </div>
        </div>
      )}
    </>
  )
}
