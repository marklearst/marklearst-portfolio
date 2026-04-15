'use client'

import { useRef } from 'react'
import { useHeroAnimation } from '@/hooks/useHeroAnimation'
import { MONOKAI } from '@/lib/monokai-colors'
import KineticText from '@/components/ui/KineticText'
import Link from 'next/link'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function EnhancedHero() {
  const { trackHeroCTAClick, trackExternalLinkClick, getPlatformFromUrl } =
    useAnalytics()
  const heroRef = useRef<HTMLDivElement | null>(null)
  const nameBoxRef = useRef<HTMLDivElement>(null)

  useHeroAnimation(heroRef as React.RefObject<HTMLDivElement>, nameBoxRef)

  return (
    <section
      ref={heroRef}
      className='relative min-h-screen flex flex-col items-center justify-start sm:justify-center px-6 pt-24 sm:pt-0 overflow-hidden'
    >
      {/* Monokai gradient line at top */}
      <div className='absolute top-0 left-0 right-0 h-1'>
        <div
          className='w-full h-full animate-gradient-x'
          style={{
            background:
              'linear-gradient(90deg, #ff6188, #fb9866, #ffd866, #a9dc75, #78dce8, #ab9df2, #ff6188)',
            backgroundSize: '200% 100%',
          }}
        />
      </div>
      {/* Gradient fade at bottom for smooth transition */}
      <div
        className='absolute bottom-0 left-0 right-0 h-64 pointer-events-none'
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${MONOKAI.background} 100%)`,
        }}
      />

      {/* Main Content */}
      <div className='max-w-6xl w-full relative z-10'>
        {/* Terminal prompt - RESTORED */}
        <div
          className='mb-10 sm:mb-16 font-mono text-sm space-y-2 pt-4 sm:pt-8'
          style={{ color: `${MONOKAI.foreground}60` }}
        >
          <div className='flex items-center gap-2 opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards] pointer-events-none'>
            <span style={{ color: MONOKAI.green }}>❯</span>
            <span style={{ color: `${MONOKAI.foreground}70` }}>
              ~/portfolio
            </span>
            <span style={{ color: MONOKAI.purple }}>on</span>
            <span style={{ color: MONOKAI.cyan }}>main</span>
            <span style={{ color: MONOKAI.yellow }}>✓</span>
          </div>
          <div className='flex items-center gap-2 opacity-0 animate-[fadeIn_0.8s_ease-out_0.4s_forwards] pointer-events-none'>
            <span style={{ color: MONOKAI.green }}>❯</span>
            <span style={{ color: `${MONOKAI.foreground}90` }}>whoami</span>
            <span
              className='inline-block w-2 h-4 ml-1 animate-pulse'
              style={{ backgroundColor: `${MONOKAI.foreground}60` }}
            />
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

        {/* TAGLINE - Full width, with color accents and letter spacing */}
        <p
          className='hero-description text-[clamp(20px,2.5vw,32px)] leading-[1.4] mb-8 max-w-5xl opacity-0 font-mono'
          style={{
            color: `${MONOKAI.foreground}dd`,
            fontWeight: 400,
          }}
        >
          <span style={{ color: MONOKAI.orange, letterSpacing: '0.02em' }}>
            Senior Frontend & Design Engineer
          </span>{' '}
          who builds <span style={{ color: MONOKAI.green }}>accessible</span>{' '}
          <span style={{ color: MONOKAI.purple }}>design systems</span> and{' '}
          <span style={{ color: MONOKAI.cyan }}>React</span> component libraries
          that teams actually want to use.
        </p>

        {/* BIO - clean text, no inline pills */}
        <div className='hero-bio relative mb-10 opacity-0'>
          <p
            className='text-[clamp(15px,1.6vw,18px)] leading-relaxed max-w-4xl font-mono'
            style={{ color: `${MONOKAI.foreground}99` }}
          >
            At <span style={{ color: MONOKAI.foreground }}>GM</span>, I
            architected Aurora serving 4 brands with{' '}
            <span style={{ color: MONOKAI.yellow }}>60% component reuse</span>{' '}
            and WCAG 2.2 AA compliance. I ship open-source with real adoption:{' '}
            <span style={{ color: MONOKAI.cyan }}>a11y Companion</span> (200+
            users),{' '}
            <span style={{ color: MONOKAI.purple }}>FigmaVars Hooks</span>,{' '}
            <span style={{ color: MONOKAI.pink }}>Diabetic Utils</span>.
          </p>
        </div>

        {/* CTAs - Clean buttons with expanding outline on hover */}
        <div className='hero-ctas flex flex-wrap items-center gap-4 mb-14 opacity-0'>
          {/* Primary CTA - Solid with expanding cyan outline */}
          <Link
            href='/work'
            onClick={() => {
              trackHeroCTAClick({ action: 'view_work', location: 'hero' })
            }}
            className='group relative px-8 py-4 font-mono text-base font-bold rounded-lg transition-all duration-300'
            style={{
              backgroundColor: MONOKAI.foreground,
              color: MONOKAI.background,
              outline: `0px solid ${MONOKAI.cyan}`,
              outlineOffset: '0px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.outline = `3px solid ${MONOKAI.cyan}`
              e.currentTarget.style.outlineOffset = '3px'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.outline = `0px solid ${MONOKAI.cyan}`
              e.currentTarget.style.outlineOffset = '0px'
            }}
          >
            <span className='relative z-10 flex items-center gap-2.5'>
              View Work
              <svg
                className='w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M19 14l-7 7m0 0l-7-7m7 7V3'
                />
              </svg>
            </span>
          </Link>

          {/* GitHub button - Ghost with expanding pink outline */}
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
            className='group relative px-8 py-4 font-mono text-base font-semibold rounded-lg transition-all duration-300'
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${MONOKAI.foreground}40`,
              color: MONOKAI.foreground,
              outline: `0px solid ${MONOKAI.pink}`,
              outlineOffset: '0px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = MONOKAI.foreground
              e.currentTarget.style.outline = `3px solid ${MONOKAI.pink}`
              e.currentTarget.style.outlineOffset = '3px'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${MONOKAI.foreground}40`
              e.currentTarget.style.outline = `0px solid ${MONOKAI.pink}`
              e.currentTarget.style.outlineOffset = '0px'
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
