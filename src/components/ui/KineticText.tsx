'use client'

import { useState, useRef } from 'react'
import { gsap } from 'gsap'

interface KineticTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
}

export default function KineticText({ text, className = '', style }: KineticTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (!containerRef.current) return

    const chars = containerRef.current.querySelectorAll('.kinetic-char')
    chars.forEach((char, i) => {
      gsap.to(char, {
        letterSpacing: '0.05em',
        duration: 0.4,
        ease: 'power2.out',
        delay: i * 0.02,
      })
    })
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (!containerRef.current) return

    const chars = containerRef.current.querySelectorAll('.kinetic-char')
    chars.forEach((char, i) => {
      gsap.to(char, {
        letterSpacing: '0',
        duration: 0.3,
        ease: 'power2.inOut',
        delay: i * 0.01,
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
        <span
          key={i}
          className='kinetic-char inline-block'
          style={{ letterSpacing: 0 }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}
