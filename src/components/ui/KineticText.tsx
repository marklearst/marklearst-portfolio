'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'

interface KineticTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
}

export default function KineticText({
  text,
  className = '',
  style,
}: KineticTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = () => {
    if (!containerRef.current) return

    const chars = containerRef.current.querySelectorAll('.kinetic-char')
    chars.forEach((char, i) => {
      gsap.to(char, {
        x: i * 1.3, // Spread characters apart using transform (GPU-accelerated)
        duration: 0.4,
        ease: 'power2.out',
        delay: i * 0.015,
      })
    })
  }

  const handleMouseLeave = () => {
    if (!containerRef.current) return

    const chars = containerRef.current.querySelectorAll('.kinetic-char')
    chars.forEach((char, i) => {
      gsap.to(char, {
        x: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        delay: i * 0.008,
      })
    })
  }

  return (
    <span
      ref={containerRef}
      className={className}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text.split('').map((char, i) => (
        // Wrapper provides the clip-path mask for reveal animation
        // pb-[0.15em] prevents descender clipping, pt for ascenders
        <span
          key={i}
          className='inline-block overflow-hidden align-bottom'
          style={{ paddingBottom: '0.15em', paddingTop: '0.05em' }}
        >
          <span
            className='kinetic-char inline-block'
            style={{ willChange: 'transform' }}
          >
            {char}
          </span>
        </span>
      ))}
    </span>
  )
}
