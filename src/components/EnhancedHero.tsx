'use client'

import { useRef, useEffect, useState } from 'react'
import { useHeroAnimation } from '@/hooks/useHeroAnimation'
import { MONOKAI } from '@/lib/monokai-colors'
import KineticText from '@/components/ui/KineticText'
import Link from 'next/link'
import { useAnalytics } from '@/hooks/useAnalytics'
import { gsap } from 'gsap'

// Typewriter component for terminal effect
function Typewriter({
  text,
  delay = 0,
  speed = 50,
  onStart,
  onComplete,
  className,
  style,
}: {
  text: string
  delay?: number
  speed?: number
  onStart?: () => void
  onComplete?: () => void
  className?: string
  style?: React.CSSProperties
}) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true)
      if (onStart) onStart()
    }, delay)
    return () => clearTimeout(startTimeout)
  }, [delay, onStart])

  useEffect(() => {
    if (!started) return
    if (displayed.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1))
      }, speed)
      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [started, displayed, text, speed, onComplete])

  return (
    <span className={className} style={style}>
      {displayed}
    </span>
  )
}

export default function EnhancedHero() {
  const { trackHeroCTAClick, trackExternalLinkClick, getPlatformFromUrl } =
    useAnalytics()
  const heroRef = useRef<HTMLDivElement | null>(null)
  const nameBoxRef = useRef<HTMLDivElement>(null)
  const [line1Started, setLine1Started] = useState(false)
  const [line1Done, setLine1Done] = useState(false)
  const [line2Done, setLine2Done] = useState(false)

  useHeroAnimation(heroRef as React.RefObject<HTMLDivElement>, nameBoxRef)

  return (
    <section
      ref={heroRef}
      className='relative min-h-screen flex flex-col items-center justify-start sm:justify-center px-6 pt-24 sm:pt-0 overflow-hidden'
    >
      {/* Gradient fade at bottom for smooth transition */}
      <div
        className='absolute bottom-0 left-0 right-0 h-64 pointer-events-none'
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${MONOKAI.background} 100%)`,
        }}
      />

      {/* Main Content */}
      <div className='max-w-6xl w-full relative z-10'>
        {/* Terminal prompt - Typewriter animation */}
        <div
          className='mb-10 sm:mb-16 font-mono text-sm space-y-2 pt-4 sm:pt-8'
          style={{ color: `${MONOKAI.foreground}60` }}
        >
          <div className='flex items-center gap-2 pointer-events-none flex-nowrap whitespace-nowrap'>
            <span
              className={`transition-opacity duration-200 ${
                line1Started ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ color: MONOKAI.green }}
            >
              ❯
            </span>
            {!line1Done ? (
              // Typing phase - all muted color
              <Typewriter
                text='~/portfolio on main ✓'
                delay={0}
                speed={35}
                onStart={() => setLine1Started(true)}
                onComplete={() => setLine1Done(true)}
                style={{ color: `${MONOKAI.foreground}60` }}
              />
            ) : (
              // Complete - colorized segments, no animation
              <>
                <span style={{ color: `${MONOKAI.foreground}70` }}>
                  ~/portfolio
                </span>
                <span style={{ color: MONOKAI.purple }}>on</span>
                <span style={{ color: MONOKAI.cyan }}>main</span>
                <span style={{ color: MONOKAI.yellow }}>✓</span>
              </>
            )}
          </div>
          <div
            className={`flex items-center gap-2 pointer-events-none flex-nowrap whitespace-nowrap transition-opacity duration-300 ${
              line1Done ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span style={{ color: MONOKAI.green }}>❯</span>
            {line1Done && (
              <Typewriter
                text='whoami'
                delay={100}
                speed={60}
                onComplete={() => setLine2Done(true)}
                style={{ color: `${MONOKAI.foreground}90` }}
              />
            )}
            {line2Done && (
              <span
                className='inline-block w-2 h-4 ml-1 animate-pulse'
                style={{ backgroundColor: `${MONOKAI.foreground}60` }}
              />
            )}
          </div>
        </div>

        {/* NAME - Clean, powerful, with kinetic hover effect */}
        <div ref={nameBoxRef} className='mb-6 opacity-0'>
          <h1
            className='text-[clamp(36px,12vw,84px)] sm:text-[clamp(64px,10vw,140px)] leading-[0.9] font-mono tracking-[-0.03em] sm:tracking-[-0.02em] whitespace-nowrap'
            style={{
              fontWeight: 700,
              color: MONOKAI.foreground,
            }}
          >
            <KineticText text='marklearst' />
          </h1>
        </div>

        {/* TAGLINE - Split word animation with semantic color accents */}
        <p
          className='hero-description text-[clamp(20px,2.5vw,32px)] leading-[1.4] mb-6 max-w-5xl opacity-0 font-mono'
          style={{
            color: `${MONOKAI.foreground}dd`,
            fontWeight: 400,
            perspective: '1000px', // Enable 3D transforms
          }}
        >
          <span
            className='hero-description-word inline-block'
            style={{ color: MONOKAI.foreground, letterSpacing: '0.01em' }}
          >
            Senior
          </span>{' '}
          <span
            className='hero-description-word inline-block'
            style={{ color: MONOKAI.foreground, letterSpacing: '0.01em' }}
          >
            Design
          </span>{' '}
          <span
            className='hero-description-word inline-block'
            style={{ color: MONOKAI.foreground, letterSpacing: '0.01em' }}
          >
            Engineer
          </span>{' '}
          <span className='hero-description-word inline-block'>who</span>{' '}
          <span className='hero-description-word inline-block'>builds</span>{' '}
          <span
            className='hero-description-word inline-block'
            style={{ color: MONOKAI.green }}
          >
            accessible
          </span>{' '}
          <span
            className='hero-description-word inline-block'
            style={{ color: MONOKAI.purple }}
          >
            design
          </span>{' '}
          <span
            className='hero-description-word inline-block'
            style={{ color: MONOKAI.purple }}
          >
            systems
          </span>{' '}
          <span className='hero-description-word inline-block'>and</span>{' '}
          <span
            className='hero-description-word inline-block'
            style={{ color: MONOKAI.cyan }}
          >
            React
          </span>{' '}
          <span className='hero-description-word inline-block'>component</span>{' '}
          <span className='hero-description-word inline-block'>libraries</span>{' '}
          <span className='hero-description-word inline-block'>that</span>{' '}
          <span className='hero-description-word inline-block'>teams</span>{' '}
          <span className='hero-description-word inline-block'>actually</span>{' '}
          <span className='hero-description-word inline-block'>want</span>{' '}
          <span className='hero-description-word inline-block'>to</span>{' '}
          <span className='hero-description-word inline-block'>use.</span>
        </p>

        {/* Skill badges - minimal, background only, no border, no hover */}
        <div className='hero-badges flex flex-wrap gap-2 mb-8 opacity-0'>
          {[
            { label: 'React', color: MONOKAI.cyan },
            { label: 'TypeScript', color: MONOKAI.cyan },
            { label: 'Design Systems', color: MONOKAI.purple },
            { label: 'Storybook', color: MONOKAI.orange },
            { label: 'WCAG 2.2', color: MONOKAI.green },
            { label: 'Claude Code', color: MONOKAI.yellow },
            { label: 'Open Source', color: MONOKAI.pink },
          ].map((badge) => (
            <span
              key={badge.label}
              className='px-3 py-1 font-mono text-xs rounded'
              style={{
                color: badge.color,
                backgroundColor: `${badge.color}15`,
              }}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {/* BIO - semantic color for each mention */}
        <div className='hero-bio relative mb-10 opacity-0'>
          <p
            className='text-[clamp(15px,1.6vw,18px)] leading-relaxed max-w-4xl font-mono'
            style={{ color: `${MONOKAI.foreground}99` }}
          >
            At <span style={{ color: MONOKAI.foreground }}>GM</span>, I
            architected Aurora serving 4 brands with{' '}
            <span style={{ color: MONOKAI.purple }}>60% component reuse</span>{' '}
            and <span style={{ color: MONOKAI.green }}>WCAG 2.2 AA</span>{' '}
            compliance. I ship{' '}
            <span style={{ color: MONOKAI.pink }}>open-source</span> with real
            adoption:{' '}
            <span style={{ color: MONOKAI.green }}>a11y Companion</span> (200+
            users), <span style={{ color: MONOKAI.cyan }}>FigmaVars Hooks</span>
            , <span style={{ color: MONOKAI.pink }}>Diabetic Utils</span>.
          </p>
          {/* VDS teaser */}
          <p
            className='mt-3 text-xs font-mono'
            style={{ color: `${MONOKAI.foreground}50` }}
          >
            Building{' '}
            <a
              href='https://variable-design-standard.vercel.app/'
              target='_blank'
              rel='noopener noreferrer'
              className='transition-colors hover:underline'
              style={{ color: MONOKAI.purple }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = MONOKAI.foreground)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = MONOKAI.purple)
              }
            >
              Variable Design Standard
            </a>{' '}
            — spec-driven design token governance.
          </p>
        </div>

        {/* CTAs - GSAP-powered ring expansion */}
        <div className='hero-ctas flex flex-wrap items-center gap-4 mb-14 opacity-0'>
          {/* Primary CTA - Solid with expanding cyan ring */}
          <Link
            href='/work'
            onClick={() => {
              trackHeroCTAClick({ action: 'view_work', location: 'hero' })
            }}
            className='hero-cta-primary group relative px-8 py-4 font-mono text-base font-bold rounded-lg'
            style={{
              backgroundColor: MONOKAI.foreground,
              color: MONOKAI.background,
            }}
            onMouseEnter={(e) => {
              gsap.killTweensOf(e.currentTarget)
              gsap.to(e.currentTarget, {
                boxShadow: `0 0 0 3px ${MONOKAI.background}, 0 0 0 7px ${MONOKAI.cyan}`,
                scale: 1.02,
                duration: 0.4,
                ease: 'expo.out',
              })
            }}
            onMouseLeave={(e) => {
              gsap.killTweensOf(e.currentTarget)
              gsap.to(e.currentTarget, {
                boxShadow: `0 0 0 0px ${MONOKAI.background}, 0 0 0 0px ${MONOKAI.cyan}`,
                scale: 1,
                duration: 0.3,
                ease: 'expo.out',
              })
            }}
          >
            <span className='relative z-10 flex items-center gap-2.5'>
              View Work
              <svg
                className='w-4 h-4 transition-transform duration-300 group-hover:translate-x-1'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2.5}
              >
                <path
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                  }}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M19 14l-7 7m0 0l-7-7m7 7V3'
                />
              </svg>
            </span>
          </Link>

          {/* GitHub button - Ghost with expanding pink ring */}
          <a
            href='https://github.com/marklearst'
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => {
              trackExternalLinkClick({
                platform: getPlatformFromUrl('https://github.com/marklearst'),
                href: 'https://github.com/marklearst',
                location: 'hero',
              })
            }}
            className='hero-cta-secondary group relative px-8 py-4 font-mono text-base font-semibold rounded-lg'
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${MONOKAI.foreground}40`,
              color: MONOKAI.foreground,
            }}
            onMouseEnter={(e) => {
              gsap.killTweensOf(e.currentTarget)
              gsap.to(e.currentTarget, {
                borderColor: MONOKAI.pink,
                boxShadow: `0 0 0 2px ${MONOKAI.background}, 0 0 0 6px ${MONOKAI.pink}`,
                scale: 1.02,
                duration: 0.4,
                ease: 'expo.out',
              })
            }}
            onMouseLeave={(e) => {
              gsap.killTweensOf(e.currentTarget)
              gsap.to(e.currentTarget, {
                borderColor: `${MONOKAI.foreground}40`,
                boxShadow: `0 0 0 0px ${MONOKAI.background}, 0 0 0 0px ${MONOKAI.pink}`,
                scale: 1,
                duration: 0.3,
                ease: 'expo.out',
              })
            }}
          >
            <span className='flex items-center gap-2.5'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                <path
                  fillRule='evenodd'
                  d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
                  clipRule='evenodd'
                />
              </svg>
              GitHub
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
