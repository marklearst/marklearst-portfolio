/**
 * Particle Physics System
 * Spring-based attraction with damping for organic motion
 */

import { MONOKAI, type MonokaiColor } from './monokai-colors'
import type { LetterformPoint } from './letterform-paths'

export interface Particle {
  x: number // Current position
  y: number
  vx: number // Velocity
  vy: number
  targetX: number // Target position (letterform point)
  targetY: number
  color: MonokaiColor
  size: number
  opacity: number
}

export interface ParticleSystemConfig {
  particleCount: number
  canvasWidth: number
  canvasHeight: number
  letterformPoints: LetterformPoint[]
  damping?: number
  springStrength?: number
}

/**
 * Initialize particles with random positions and velocities
 */
export function createParticles(config: ParticleSystemConfig): Particle[] {
  const {
    particleCount,
    canvasWidth,
    canvasHeight,
    letterformPoints,
  } = config

  const particles: Particle[] = []
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  for (let i = 0; i < particleCount; i++) {
    // Random angle and distance from center for explosion effect
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * 50 + 20 // Start close to center
    const speed = Math.random() * 2 + 1

    // Get target point (cycle through letterform points)
    const targetPoint = letterformPoints[i % letterformPoints.length]

    // Random color from Monokai palette
    const color =
      MONOKAI.particles[
        Math.floor(Math.random() * MONOKAI.particles.length)
      ]

    particles.push({
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      targetX: targetPoint.x,
      targetY: targetPoint.y,
      color,
      size: Math.random() * 2 + 2, // 2-4px
      opacity: 0,
    })
  }

  return particles
}

/**
 * Update particle positions with spring physics
 * Returns true if all particles have settled
 */
export function updateParticles(
  particles: Particle[],
  damping: number = 0.85,
  springStrength: number = 0.05,
): boolean {
  let allSettled = true
  const settleThreshold = 0.5 // Consider settled if within 0.5px of target

  particles.forEach((particle) => {
    // Calculate spring force toward target
    const dx = particle.targetX - particle.x
    const dy = particle.targetY - particle.y

    // Apply spring force
    particle.vx += dx * springStrength
    particle.vy += dy * springStrength

    // Apply damping (friction)
    particle.vx *= damping
    particle.vy *= damping

    // Update position
    particle.x += particle.vx
    particle.y += particle.vy

    // Fade in opacity as particle moves
    if (particle.opacity < 1) {
      particle.opacity = Math.min(1, particle.opacity + 0.02)
    }

    // Check if settled
    const distance = Math.sqrt(dx * dx + dy * dy)
    const speed = Math.sqrt(
      particle.vx * particle.vx + particle.vy * particle.vy,
    )

    if (distance > settleThreshold || speed > settleThreshold) {
      allSettled = false
    }
  })

  return allSettled
}

/**
 * Update particles with simpler linear interpolation (mobile)
 * Faster but less organic than spring physics
 */
export function updateParticlesSimple(
  particles: Particle[],
  lerpFactor: number = 0.1,
): boolean {
  let allSettled = true
  const settleThreshold = 0.5

  particles.forEach((particle) => {
    const dx = particle.targetX - particle.x
    const dy = particle.targetY - particle.y

    // Linear interpolation toward target
    particle.x += dx * lerpFactor
    particle.y += dy * lerpFactor

    // Fade in
    if (particle.opacity < 1) {
      particle.opacity = Math.min(1, particle.opacity + 0.03)
    }

    // Check if settled
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > settleThreshold) {
      allSettled = false
    }
  })

  return allSettled
}

/**
 * Render particles to canvas
 */
export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
) {
  particles.forEach((particle) => {
    ctx.fillStyle = particle.color
    ctx.globalAlpha = particle.opacity

    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.globalAlpha = 1
}

/**
 * Add subtle drift animation to settled particles
 */
export function addDrift(particles: Particle[], time: number) {
  particles.forEach((particle, i) => {
    const offset = i * 0.1 // Phase offset per particle
    const driftX = Math.sin(time * 0.001 + offset) * 2
    const driftY = Math.cos(time * 0.0015 + offset) * 2

    particle.x = particle.targetX + driftX
    particle.y = particle.targetY + driftY
  })
}
