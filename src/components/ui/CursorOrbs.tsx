'use client'

import { useEffect, useState, useRef } from 'react'
import { MONOKAI } from '@/lib/monokai-colors'

interface OrbState {
  x: number
  y: number
  angle: number
}

const COLORS = [
  MONOKAI.pink,    // #ff6188 - fastest
  MONOKAI.orange,  // #fb9866
  MONOKAI.yellow,  // #ffd866
  MONOKAI.green,   // #a9dc75
  MONOKAI.cyan,    // #78dce8
  MONOKAI.purple,  // #ab9df2 - slowest
]

const ORBIT_RADIUS = 28
const ORB_SIZE = 8
const STOP_DELAY = 150
const IDLE_FADE_DELAY = 7000 // 7 seconds before fading
const IDLE_OPACITY = 0.15 // Fade to 15% when idle

export default function CursorOrbs() {
  const [orbs, setOrbs] = useState<OrbState[]>(() =>
    COLORS.map((_, i) => ({
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
      angle: (i / COLORS.length) * Math.PI * 2,
    }))
  )

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMoving, setIsMoving] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isIdle, setIsIdle] = useState(false)
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle mouse movement
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      setIsMoving(true)
      setHasInteracted(true)
      setIsIdle(false) // Reset idle state on any movement

      // Clear existing idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }

      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsMoving(false)

        // Start idle fade timer
        idleTimeoutRef.current = setTimeout(() => {
          setIsIdle(true)
        }, IDLE_FADE_DELAY)
      }, STOP_DELAY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeoutId)
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (!hasInteracted) return

    let animationId: number

    const animate = () => {
      setOrbs(prevOrbs => {
        return prevOrbs.map((orb, index) => {
          if (isMoving) {
            // TRAILING MODE: Each orb follows cursor at different speeds
            // Pink (index 0) is fastest, Purple (index 5) is slowest
            const speed = 0.15 - (index * 0.02)

            return {
              ...orb,
              x: orb.x + (mousePos.x - orb.x) * speed,
              y: orb.y + (mousePos.y - orb.y) * speed,
              angle: orb.angle,
            }
          } else {
            // ORBIT MODE: Rotate around cursor position
            const newAngle = orb.angle + 0.02
            const targetX = mousePos.x + Math.cos(newAngle) * ORBIT_RADIUS
            const targetY = mousePos.y + Math.sin(newAngle) * ORBIT_RADIUS

            return {
              ...orb,
              x: orb.x + (targetX - orb.x) * 0.08,
              y: orb.y + (targetY - orb.y) * 0.08,
              angle: newAngle,
            }
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [isMoving, mousePos, hasInteracted])

  if (!hasInteracted) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 5,
        mixBlendMode: 'screen',
        opacity: isIdle ? IDLE_OPACITY : 1,
        transition: 'opacity 1.5s ease-out',
      }}
    >
      {orbs.map((orb, index) => (
        <div
          key={index}
          className="absolute rounded-full"
          style={{
            left: orb.x,
            top: orb.y,
            width: ORB_SIZE,
            height: ORB_SIZE,
            transform: 'translate(-50%, -50%)',
            backgroundColor: COLORS[index],
          }}
        />
      ))}
    </div>
  )
}
