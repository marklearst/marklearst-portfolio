'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const orbsRef = useRef<OrbState[]>([])
  const orbElementsRef = useRef<(HTMLDivElement | null)[]>([])
  const mousePosRef = useRef({ x: 0, y: 0 })
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const isMovingRef = useRef(false)
  const isIdleRef = useRef(false)
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const updateEnabled = () => {
      if (typeof window === 'undefined') return
      const isLargeScreen = window.matchMedia('(min-width: 1024px)').matches
      const isFinePointer = window.matchMedia('(pointer: fine)').matches
      const isHoverCapable = window.matchMedia('(hover: hover)').matches
      setIsEnabled(isLargeScreen && isFinePointer && isHoverCapable)
    }

    updateEnabled()

    window.addEventListener('resize', updateEnabled)
    return () => {
      window.removeEventListener('resize', updateEnabled)
    }
  }, [])

  useEffect(() => {
    if (!isEnabled) {
      setHasInteracted(false)
      return
    }
    if (typeof window === 'undefined') return
    const startX = window.innerWidth / 2
    const startY = window.innerHeight / 2
    orbsRef.current = COLORS.map((_, i) => ({
      x: startX,
      y: startY,
      angle: (i / COLORS.length) * Math.PI * 2,
      scale: 1,
      opacity: 1,
    }))
    mousePosRef.current = { x: startX, y: startY }
    lastMousePosRef.current = { x: startX, y: startY }
  }, [isEnabled])

  // Handle mouse movement
  useEffect(() => {
    if (!isEnabled) return
    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY }

      // Calculate distance moved
      const dx = newPos.x - lastMousePosRef.current.x
      const dy = newPos.y - lastMousePosRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      mousePosRef.current = newPos
      if (!hasInteracted) {
        setHasInteracted(true)
      }

      // Only trigger trailing mode if movement exceeds threshold
      if (distance > MOVEMENT_THRESHOLD) {
        isMovingRef.current = true
        lastMousePosRef.current = newPos
      }

      // If we were idle, wake up the orbs
      if (isIdleRef.current) {
        isIdleRef.current = false
      }

      // Clear existing idle timeout
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current)
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }

      stopTimeoutRef.current = setTimeout(() => {
        isMovingRef.current = false

        // Start idle timer
        idleTimeoutRef.current = setTimeout(() => {
          isIdleRef.current = true
        }, IDLE_FADE_DELAY)
      }, STOP_DELAY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current)
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
    }
  }, [hasInteracted, isEnabled])

  // Animation loop
  useEffect(() => {
    if (!isEnabled) return
    if (!hasInteracted) return
    const animate = () => {
      const orbs = orbsRef.current
      const mousePos = mousePosRef.current
      const isMoving = isMovingRef.current
      const isIdle = isIdleRef.current

      orbs.forEach((orb, index) => {
        // Calculate target scale and opacity based on idle state
        const targetScale = isIdle ? 0 : 1
        const targetOpacity = isIdle ? 0 : 1

        // Staggered collapse/expand speeds per orb
        const collapseDelay = index * 0.02
        const expandDelay = (COLORS.length - 1 - index) * 0.02

        // Smooth interpolation with different speeds for collapse vs expand
        const scaleSpeed = isIdle ? 0.04 - collapseDelay : 0.08 - expandDelay
        const opacitySpeed = isIdle ? 0.03 - collapseDelay : 0.1 - expandDelay

        orb.scale += (targetScale - orb.scale) * Math.max(scaleSpeed, 0.02)
        orb.opacity += (targetOpacity - orb.opacity) * Math.max(opacitySpeed, 0.02)

        if (isMoving) {
          // TRAILING MODE: Each orb follows cursor at different speeds
          // Pink (index 0) is fastest, Purple (index 5) is slowest
          const speed = TRAIL_BASE_SPEED - index * TRAIL_SPEED_DECAY
          orb.x += (mousePos.x - orb.x) * speed
          orb.y += (mousePos.y - orb.y) * speed
        } else if (isIdle) {
          // COLLAPSE MODE: All orbs converge to cursor center while fading
          const collapseSpeed = 0.05
          orb.x += (mousePos.x - orb.x) * collapseSpeed
          orb.y += (mousePos.y - orb.y) * collapseSpeed
        } else {
          // ORBIT MODE: Rotate around cursor position
          orb.angle += ROTATION_SPEED
          const targetX = mousePos.x + Math.cos(orb.angle) * ORBIT_RADIUS
          const targetY = mousePos.y + Math.sin(orb.angle) * ORBIT_RADIUS
          orb.x += (targetX - orb.x) * 0.08
          orb.y += (targetY - orb.y) * 0.08
        }

        const orbEl = orbElementsRef.current[index]
        if (orbEl) {
          orbEl.style.transform = `translate3d(${orb.x}px, ${orb.y}px, 0) translate(-50%, -50%) scale(${orb.scale})`
          orbEl.style.opacity = orb.opacity.toString()
        }
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [hasInteracted, isEnabled])

  if (!isEnabled || !hasInteracted) return null

  return (
    <div
      className='fixed inset-0 pointer-events-none'
      style={{
        zIndex: 5,
        mixBlendMode: 'screen',
      }}
    >
      {COLORS.map((color, index) => (
        <div
          key={index}
          ref={(node) => {
            orbElementsRef.current[index] = node
          }}
          className='absolute left-0 top-0 rounded-full'
          style={{
            width: ORB_SIZE,
            height: ORB_SIZE,
            backgroundColor: color,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  )
}
