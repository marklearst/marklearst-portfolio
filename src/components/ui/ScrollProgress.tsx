'use client'

import { useEffect, useState } from 'react'
import { MONOKAI } from '@/lib/monokai-colors'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(scrollPercent)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className='opacity-0 fixed top-0 left-0 h-[2px] z-60 transition-all duration-100'
      style={{
        width: `${progress}%`,
        height: 4,
        background: `linear-gradient(90deg, ${MONOKAI.cyan}, ${MONOKAI.purple}, ${MONOKAI.pink})`,
        boxShadow: `0 0 10px ${MONOKAI.cyan}60`,
      }}
    />
  )
}
