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
      const chars = container.querySelectorAll('.kinetic-char')
      const move = (expanded: boolean) => gsap.to(chars, {
        y: (index: number) => expanded ? Math.sin(index * 0.65) * -5 : 0,
        duration: expanded ? 0.35 : 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      })
      const enter = () => { move(true) }
      const leave = () => { move(false) }
      container.addEventListener('pointerenter', enter)
      container.addEventListener('pointerleave', leave)
      return () => {
        container.removeEventListener('pointerenter', enter)
        container.removeEventListener('pointerleave', leave)
        gsap.killTweensOf(chars)
        gsap.set(chars, { clearProps: 'transform' })
      }
    })
    return () => media.revert()
  }, [])

  return (
    <span ref={containerRef} className={className} style={style}>
      {text.split('').map((char, index) => (
        <span key={index} className='kinetic-char inline-block'>{char === ' ' ? '\u00a0' : char}</span>
      ))}
    </span>
  )
}
