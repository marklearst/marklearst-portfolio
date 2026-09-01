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
