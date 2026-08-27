'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'

interface KineticTextProps {
  text: string
  className?: string
  style?: CSSProperties
}

export default function KineticText({ text, className = '', style }: KineticTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const media = gsap.matchMedia()
    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const chars = Array.from(container.querySelectorAll<HTMLElement>('.kinetic-char'))
      const setters = chars.map((char) => ({
        y: gsap.quickTo(char, 'y', { duration: 0.25, ease: 'power3.out' }),
        rotation: gsap.quickTo(char, 'rotation', { duration: 0.25, ease: 'power3.out' }),
      }))
      let centers: number[] = []
      const enter = () => {
        centers = chars.map((char) => {
          const rect = char.getBoundingClientRect()
          return rect.left + rect.width / 2
        })
      }
      const move = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        centers.forEach((center, index) => {
          const distance = (event.clientX - center) / 110
          const influence = Math.exp(-distance * distance)
          setters[index].y(-8 * influence)
          setters[index].rotation(3 * distance * influence)
        })
      }
      const leave = () => setters.forEach(({ y, rotation }) => { y(0); rotation(0) })
      container.addEventListener('pointerenter', enter)
      container.addEventListener('pointermove', move)
      container.addEventListener('pointerleave', leave)
      return () => {
        container.removeEventListener('pointerenter', enter)
        container.removeEventListener('pointermove', move)
        container.removeEventListener('pointerleave', leave)
        setters.forEach(({ y, rotation }) => { y.tween.kill(); rotation.tween.kill() })
        gsap.set(chars, { clearProps: 'transform' })
      }
    })
    return () => media.revert()
  }, [text])

  return (
    <span ref={containerRef} className={className} style={style}>
      {text.split('').map((char, index) => (
        <span key={index} className='kinetic-char inline-block'>{char === ' ' ? '\u00a0' : char}</span>
      ))}
    </span>
  )
}
