'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { getMLPoints } from '@/lib/letterform-paths'

interface ParticleLogo3DProps {
  width?: number
  height?: number
  particleCount?: number
  onComplete?: () => void
  autoStart?: boolean
}

const MONOKAI_COLORS = [
  new THREE.Color('#ff6188'), // pink
  new THREE.Color('#fb9866'), // orange
  new THREE.Color('#ffd866'), // yellow
  new THREE.Color('#a9dc75'), // green
  new THREE.Color('#78dce8'), // cyan
  new THREE.Color('#ab9df2'), // purple
]

export default function ParticleLogo3D({
  width = 800,
  height = 400,
  particleCount = 10000,
  onComplete,
  autoStart = true,
}: ParticleLogo3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const composerRef = useRef<EffectComposer | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetPositionsRef = useRef<Float32Array | null>(null)
  const startTimeRef = useRef<number>(0)
  const rafRef = useRef<number>(0)
  const completedRef = useRef(false)

  const [phase, setPhase] = useState<'scatter' | 'attract' | 'settle' | 'drift'>(
    'scatter',
  )

  useEffect(() => {
    if (!autoStart || !containerRef.current) return

    completedRef.current = false
    const container = containerRef.current

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#231f22')
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000,
    )
    camera.position.z = 300
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Post-processing
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.5, // strength
      0.4, // radius
      0.85, // threshold
    )
    composer.addPass(bloomPass)
    composerRef.current = composer

    // Generate ML letterform targets
    const letterformPoints = getMLPoints(width, height, particleCount)
    const targetPositions = new Float32Array(particleCount * 3)
    targetPositionsRef.current = targetPositions

    if (!targetPositionsRef.current) return

    letterformPoints.forEach((point, i) => {
      // Convert 2D points to 3D, centered
      targetPositions[i * 3] = point.x - width / 2
      targetPositions[i * 3 + 1] = -(point.y - height / 2) // Flip Y
      targetPositions[i * 3 + 2] = 0
    })

    // Particle system
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const velocities = new Float32Array(particleCount * 3)

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      // Random scattered start positions
      positions[i * 3] = (Math.random() - 0.5) * width * 2
      positions[i * 3 + 1] = (Math.random() - 0.5) * height * 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200

      // Random velocities
      velocities[i * 3] = (Math.random() - 0.5) * 2
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 2
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 2

      // Assign colors from Monokai palette
      const color = MONOKAI_COLORS[i % MONOKAI_COLORS.length]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      // Random sizes
      sizes[i] = Math.random() * 3 + 1
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // Custom shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        glowIntensity: { value: 1.0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          // Pulsing size effect
          float pulse = sin(time * 2.0 + position.x * 0.01) * 0.3 + 1.0;
          gl_PointSize = size * pulse * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float glowIntensity;

        void main() {
          // Circular particle shape with glow
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          if (dist > 0.5) discard;

          // Soft glow falloff
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 2.0);

          // Add extra glow
          float glow = exp(-dist * 4.0) * glowIntensity;

          gl_FragColor = vec4(vColor * (1.0 + glow * 0.5), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)
    particlesRef.current = particles

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    startTimeRef.current = Date.now()
    let animationStopped = false

    const animate = () => {
      if (animationStopped) return

      const now = Date.now()
      const elapsed = now - startTimeRef.current
      const time = elapsed / 1000

      // Hard cutoff at 3.5 seconds
      if (elapsed > 3500) {
        if (!completedRef.current) {
          completedRef.current = true
          animationStopped = true
          if (onComplete) onComplete()
        }
        return
      }

      // Update shader time
      if (material.uniforms) {
        material.uniforms.time.value = time
      }

      const positions = geometry.attributes.position.array as Float32Array

      // Physics based on phase
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        if (elapsed < 500) {
          // Phase 1: Scatter
          setPhase('scatter')
          positions[i3] += velocities[i3]
          positions[i3 + 1] += velocities[i3 + 1]
          positions[i3 + 2] += velocities[i3 + 2]
          velocities[i3] *= 0.98
          velocities[i3 + 1] *= 0.98
          velocities[i3 + 2] *= 0.98
        } else if (elapsed < 2500) {
          // Phase 2: Attract to target
          if (phase !== 'attract') setPhase('attract')
          const targetX = targetPositions[i3]
          const targetY = targetPositions[i3 + 1]
          const targetZ = targetPositions[i3 + 2]

          const dx = targetX - positions[i3]
          const dy = targetY - positions[i3 + 1]
          const dz = targetZ - positions[i3 + 2]

          // Mouse influence
          const mouseInfluence = 0.15
          const mouseX = mouseRef.current.x * width * 0.5
          const mouseY = mouseRef.current.y * height * 0.5
          const distToMouse = Math.sqrt(
            Math.pow(positions[i3] - mouseX, 2) +
              Math.pow(positions[i3 + 1] - mouseY, 2),
          )
          const mousePull = Math.max(0, 1 - distToMouse / 300) * mouseInfluence

          velocities[i3] += dx * 0.08 + (mouseX - positions[i3]) * mousePull * 0.02
          velocities[i3 + 1] +=
            dy * 0.08 + (mouseY - positions[i3 + 1]) * mousePull * 0.02
          velocities[i3 + 2] += dz * 0.08

          velocities[i3] *= 0.85
          velocities[i3 + 1] *= 0.85
          velocities[i3 + 2] *= 0.85

          positions[i3] += velocities[i3]
          positions[i3 + 1] += velocities[i3 + 1]
          positions[i3 + 2] += velocities[i3 + 2]
        } else {
          // Phase 3: Settle & Drift
          if (phase !== 'settle' && phase !== 'drift') setPhase('settle')
          if (elapsed > 2800) setPhase('drift')

          const targetX = targetPositions[i3]
          const targetY = targetPositions[i3 + 1]
          const targetZ = targetPositions[i3 + 2]

          const dx = targetX - positions[i3]
          const dy = targetY - positions[i3 + 1]
          const dz = targetZ - positions[i3 + 2]

          // Gentle drift
          const drift = Math.sin(time * 0.5 + i * 0.01) * 0.3
          velocities[i3] += dx * 0.15
          velocities[i3 + 1] += dy * 0.15 + drift * 0.1
          velocities[i3 + 2] += dz * 0.15

          velocities[i3] *= 0.9
          velocities[i3 + 1] *= 0.9
          velocities[i3 + 2] *= 0.9

          positions[i3] += velocities[i3]
          positions[i3 + 1] += velocities[i3 + 1]
          positions[i3 + 2] += velocities[i3 + 2]
        }
      }

      geometry.attributes.position.needsUpdate = true

      // Subtle camera drift
      camera.position.x = Math.sin(time * 0.2) * 10
      camera.position.y = Math.cos(time * 0.3) * 10
      camera.lookAt(0, 0, 0)

      // Render
      if (composer) {
        composer.render()
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      animationStopped = true
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [width, height, particleCount, autoStart, onComplete, phase])

  return (
    <div
      ref={containerRef}
      className='relative flex items-center justify-center'
      style={{ width, height }}
    />
  )
}
