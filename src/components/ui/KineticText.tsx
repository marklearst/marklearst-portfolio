'use client'

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
  return (
    <span className={className} style={style}>
      {text.split('').map((char, i) => (
        // Outer span is the clip mask the intro rises through.
        // Padding keeps ascenders and descenders inside the mask.
        <span
          key={i}
          className='inline-block overflow-hidden align-bottom'
          style={{ paddingBottom: '0.15em', paddingTop: '0.05em' }}
        >
          <span className='kinetic-char inline-block'>{char}</span>
        </span>
      ))}
    </span>
  )
}
