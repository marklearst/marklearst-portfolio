'use client'

import { useEffect, useRef, useState } from 'react'
import { getMLPoints } from '@/lib/letterform-paths'
import {
  createParticles,
  updateParticles,
  updateParticlesSimple,
  renderParticles,
  addDrift,
  type Particle,
} from '@/lib/particle-system'
import { MONOKAI } from '@/lib/monokai-colors'

interface ParticleLogoProps {
  width?: number
  height?: number
  particleCount?: number
  onComplete?: () => void
  autoStart?: boolean
}

export default function ParticleLogo({
  width = 800,
  height = 400,
  particleCount = 200,
  onComplete,
  autoStart = true,
}: ParticleLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const [phase, setPhase] = useState<'scatter' | 'attract' | 'settle' | 'drift'>('scatter')
  const startTimeRef = useRef<number>(0)
  const settledTimeRef = useRef<number>(0)
  const completedRef = useRef<boolean>(false)

  // Detect mobile for simpler physics
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const actualParticleCount = isMobile ? Math.floor(particleCount / 2) : particleCount

  useEffect(() => {
    if (!autoStart) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Reset completion flag
    completedRef.current = false
    let animationStopped = false

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    // Generate letterform target points
    const letterformPoints = getMLPoints(width, height, actualParticleCount)

    // Create particles
    particlesRef.current = createParticles({
      particleCount: actualParticleCount,
      canvasWidth: width,
      canvasHeight: height,
      letterformPoints,
    })

    startTimeRef.current = Date.now()

    // Animation loop
    const animate = () => {
      // Hard stop check
      if (animationStopped) return

      const now = Date.now()
      const elapsed = now - startTimeRef.current

      // Clear canvas
      ctx.fillStyle = MONOKAI.background
      ctx.fillRect(0, 0, width, height)

      // Hard cutoff at 3.5 seconds
      if (elapsed > 3500) {
        if (!completedRef.current) {
          completedRef.current = true
          animationStopped = true
          console.log('Particle logo animation complete - hard stop at 3.5s')

          // Render final state
          renderParticles(ctx, particlesRef.current)

          if (onComplete) {
            onComplete()
          }
        }
        return // STOP
      }

      // Phase 1: Scatter (0-500ms)
      if (elapsed < 500) {
        setPhase('scatter')
        if (isMobile) {
          updateParticlesSimple(particlesRef.current, 0.05)
        } else {
          updateParticles(particlesRef.current, 0.95, 0.02)
        }
      }
      // Phase 2: Attract (500-2500ms)
      else if (elapsed < 2500) {
        if (phase !== 'attract') setPhase('attract')
        if (isMobile) {
          updateParticlesSimple(particlesRef.current, 0.15)
        } else {
          updateParticles(particlesRef.current, 0.85, 0.08)
        }
      }
      // Phase 3: Settle (2500-3500ms)
      else {
        if (phase !== 'settle' && phase !== 'drift') {
          setPhase('settle')
          settledTimeRef.current = now
        }

        if (isMobile) {
          updateParticlesSimple(particlesRef.current, 0.2)
        } else {
          updateParticles(particlesRef.current, 0.9, 0.15)
        }

        if (now - settledTimeRef.current > 300) {
          setPhase('drift')
          if (!isMobile) {
            addDrift(particlesRef.current, now)
          }
        }
      }

      // Render
      renderParticles(ctx, particlesRef.current)

      // Continue if not stopped
      if (!animationStopped) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      animationStopped = true
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [width, height, actualParticleCount, autoStart, isMobile, phase, onComplete])

  return (
    <div className='relative flex items-center justify-center'>
      <canvas
        ref={canvasRef}
        className='max-w-full h-auto'
        style={{
          imageRendering: 'crisp-edges',
        }}
      />
    </div>
  )
}
