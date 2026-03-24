'use client'

import { useEffect, useState, useRef } from 'react'
import { MONOKAI } from '@/lib/monokai-colors'

interface OrbState {
  x: number
  y: number
  angle: number
  scale: number
  opacity: number
}

const COLORS = [
  MONOKAI.pink, // #ff6188 - fastest
  MONOKAI.orange, // #fb9866
  MONOKAI.yellow, // #ffd866
  MONOKAI.green, // #a9dc75
  MONOKAI.cyan, // #78dce8
  MONOKAI.purple, // #ab9df2 - slowest
]

// Configuration
const ORBIT_RADIUS = 24
const ORB_SIZE = 7
const STOP_DELAY = 250
const IDLE_FADE_DELAY = 5000 // 5 seconds before collapsing
const ROTATION_SPEED = 0.01 // Slower rotation (was 0.02)
const MOVEMENT_THRESHOLD = 5 // Pixels of movement to trigger trailing mode

// Trail behavior - creates longer ribbon trail
const TRAIL_BASE_SPEED = 0.12 // Base follow speed
const TRAIL_SPEED_DECAY = 0.016 // Speed reduction per orb

export default function CursorOrbs() {
  const [orbs, setOrbs] = useState<OrbState[]>(() =>
    COLORS.map((_, i) => ({
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
      angle: (i / COLORS.length) * Math.PI * 2,
      scale: 1,
      opacity: 1,
    })),
  )

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMoving, setIsMoving] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isIdle, setIsIdle] = useState(false)
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastMousePos = useRef({ x: 0, y: 0 })

  // Handle mouse movement
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY }

      // Calculate distance moved
      const dx = newPos.x - lastMousePos.current.x
      const dy = newPos.y - lastMousePos.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      setMousePos(newPos)
      setHasInteracted(true)

      // Only trigger trailing mode if movement exceeds threshold
      if (distance > MOVEMENT_THRESHOLD) {
        setIsMoving(true)
        lastMousePos.current = newPos
      }

      // If we were idle, wake up the orbs
      if (isIdle) {
        setIsIdle(false)
      }

      // Clear existing idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }

      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsMoving(false)

        // Start idle timer
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
  }, [isIdle])

  // Animation loop
  useEffect(() => {
    if (!hasInteracted) return

    let animationId: number

    const animate = () => {
      setOrbs((prevOrbs) => {
        return prevOrbs.map((orb, index) => {
          // Calculate target scale and opacity based on idle state
          const targetScale = isIdle ? 0 : 1
          const targetOpacity = isIdle ? 0 : 1

          // Staggered collapse/expand speeds per orb
          const collapseDelay = index * 0.02
          const expandDelay = (COLORS.length - 1 - index) * 0.02

          // Smooth interpolation with different speeds for collapse vs expand
          const scaleSpeed = isIdle ? 0.04 - collapseDelay : 0.08 - expandDelay
          const opacitySpeed = isIdle ? 0.03 - collapseDelay : 0.1 - expandDelay

          const newScale =
            orb.scale + (targetScale - orb.scale) * Math.max(scaleSpeed, 0.02)
          const newOpacity =
            orb.opacity +
            (targetOpacity - orb.opacity) * Math.max(opacitySpeed, 0.02)

          if (isMoving) {
            // TRAILING MODE: Each orb follows cursor at different speeds
            // Pink (index 0) is fastest, Purple (index 5) is slowest
            const speed = TRAIL_BASE_SPEED - index * TRAIL_SPEED_DECAY

            return {
              ...orb,
              x: orb.x + (mousePos.x - orb.x) * speed,
              y: orb.y + (mousePos.y - orb.y) * speed,
              angle: orb.angle,
              scale: newScale,
              opacity: newOpacity,
            }
          } else if (isIdle) {
            // COLLAPSE MODE: All orbs converge to cursor center while fading
            const collapseSpeed = 0.05

            return {
              ...orb,
              x: orb.x + (mousePos.x - orb.x) * collapseSpeed,
              y: orb.y + (mousePos.y - orb.y) * collapseSpeed,
              angle: orb.angle,
              scale: newScale,
              opacity: newOpacity,
            }
          } else {
            // ORBIT MODE: Rotate around cursor position
            const newAngle = orb.angle + ROTATION_SPEED
            const targetX = mousePos.x + Math.cos(newAngle) * ORBIT_RADIUS
            const targetY = mousePos.y + Math.sin(newAngle) * ORBIT_RADIUS

            return {
              ...orb,
              x: orb.x + (targetX - orb.x) * 0.08,
              y: orb.y + (targetY - orb.y) * 0.08,
              angle: newAngle,
              scale: newScale,
              opacity: newOpacity,
            }
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [isMoving, isIdle, mousePos, hasInteracted])

  if (!hasInteracted) return null

  return (
    <div
      className='fixed inset-0 pointer-events-none'
      style={{
        zIndex: 5,
        mixBlendMode: 'screen',
      }}
    >
      {orbs.map((orb, index) => (
        <div
          key={index}
          className='absolute rounded-full'
          style={{
            left: orb.x,
            top: orb.y,
            width: ORB_SIZE,
            height: ORB_SIZE,
            transform: `translate(-50%, -50%) scale(${orb.scale})`,
            opacity: orb.opacity,
            backgroundColor: COLORS[index],
          }}
        />
      ))}
    </div>
  )
}
