'use client'

import { useTextScramble } from '@/hooks/useTextScramble'

interface ScrambleTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div'
  scrambleOnHover?: boolean
  duration?: number
}

export default function ScrambleText({
  text,
  className = '',
  style,
  as: Tag = 'span',
  scrambleOnHover = true,
  duration = 600,
}: ScrambleTextProps) {
  const { displayText, scramble, reset } = useTextScramble(text, duration)

  return (
    <Tag
      className={className}
      style={style}
      onMouseEnter={scrambleOnHover ? scramble : undefined}
      onMouseLeave={scrambleOnHover ? reset : undefined}
    >
      {displayText}
    </Tag>
  )
}
