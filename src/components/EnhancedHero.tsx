'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { MONOKAI } from '@/lib/monokai-colors'
import KineticText from '@/components/ui/KineticText'

export default function EnhancedHero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const nameBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fast overlapping sequence - no slow junior animations
      const tl = gsap.timeline({ delay: 0.3 })

      // Name box entrance
      tl.fromTo(
        nameBoxRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      )

      // Content reveals with tight overlap
      tl.fromTo(
        '.hero-description',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3', // Overlap by 0.3s
      )

      tl.fromTo(
        '.hero-bio',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3',
      )

      tl.fromTo(
        '.hero-ctas',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3',
      )

      // Badges with stagger - smooth fade in, NO pop - FASTER
      tl.fromTo(
        '.hero-badge',
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.03,
          ease: 'power2.out',
        },
        '-=0.35',
      )

      // Background keywords - ORGANIC FLUID MOTION
      const keywords = gsap.utils.toArray<HTMLElement>('.bg-keyword')

      keywords.forEach((el, i) => {
        // Random parameters for each keyword - creates variety
        const baseSpeedX = gsap.utils.random(20, 40)
        const baseSpeedY = gsap.utils.random(25, 45)
        const baseSpeedRotate = gsap.utils.random(30, 60)
        const distanceX = gsap.utils.random(20, 50)
        const distanceY = gsap.utils.random(15, 40)
        const rotateAmount = gsap.utils.random(-8, 8)
        const scaleVariance = gsap.utils.random(0.95, 1.05)

        // X-axis drift (independent timing)
        gsap.to(el, {
          x: `+=${distanceX}`,
          duration: baseSpeedX,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2 + Math.random() * 2,
        })

        // Y-axis drift (different timing for organic feel)
        gsap.to(el, {
          y: `+=${distanceY}`,
          duration: baseSpeedY,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.15 + Math.random() * 3,
        })

        // Subtle rotation (very slow, creates life)
        gsap.to(el, {
          rotation: rotateAmount,
          duration: baseSpeedRotate,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.25,
        })

        // Subtle scale pulse (breathing effect)
        gsap.to(el, {
          scale: scaleVariance,
          duration: gsap.utils.random(8, 15),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3 + Math.random(),
        })

        // Subtle opacity pulse for depth
        gsap.to(el, {
          opacity: `*=${gsap.utils.random(0.7, 1.3)}`,
          duration: gsap.utils.random(10, 20),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.1 + Math.random() * 2,
        })
      })

      // Cursor repel effect
      const handleMouseMove = (e: MouseEvent) => {
        const mouseX = e.clientX
        const mouseY = e.clientY

        keywords.forEach((el) => {
          const rect = el.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2

          // Calculate distance from cursor to keyword center
          const deltaX = centerX - mouseX
          const deltaY = centerY - mouseY
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

          // Repel radius (how far the effect reaches)
          const repelRadius = 150

          if (distance < repelRadius) {
            // Calculate repel force (stronger when closer)
            const force = (repelRadius - distance) / repelRadius
            const repelX = (deltaX / distance) * force * 40
            const repelY = (deltaY / distance) * force * 40

            // Apply repel with smooth animation
            gsap.to(el, {
              x: repelX,
              y: repelY,
              duration: 0.3,
              ease: 'power2.out',
            })
          } else {
            // Return to original position when cursor moves away
            gsap.to(el, {
              x: 0,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
            })
          }
        })
      }

      window.addEventListener('mousemove', handleMouseMove)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  // DENSE background keywords with Monokai colors
  const keywords = [
    // Top left quadrant
    { text: 'function', x: '5%', y: '8%', size: 'text-5xl', color: MONOKAI.pink, opacity: 0.12 },
    { text: 'return', x: '8%', y: '15%', size: 'text-3xl', color: MONOKAI.pink, opacity: 0.08 },
    { text: 'const', x: '3%', y: '22%', size: 'text-2xl', color: MONOKAI.green, opacity: 0.1 },
    { text: 'interface', x: '12%', y: '12%', size: 'text-4xl', color: MONOKAI.cyan, opacity: 0.09 },
    { text: 'color.primary', x: '6%', y: '28%', size: 'text-lg', color: MONOKAI.yellow, opacity: 0.08 },
    { text: 'TS', x: '15%', y: '20%', size: 'text-6xl', color: MONOKAI.cyan, opacity: 0.06 },
    { text: 'spacing.xl', x: '10%', y: '35%', size: 'text-base', color: MONOKAI.orange, opacity: 0.07 },
    { text: 'dev', x: '4%', y: '42%', size: 'text-4xl', color: MONOKAI.purple, opacity: 0.1 },

    // Top right quadrant
    { text: 'design', x: '82%', y: '10%', size: 'text-5xl', color: MONOKAI.purple, opacity: 0.11 },
    { text: 'code', x: '88%', y: '18%', size: 'text-4xl', color: MONOKAI.cyan, opacity: 0.09 },
    { text: 'type', x: '85%', y: '25%', size: 'text-3xl', color: MONOKAI.pink, opacity: 0.08 },
    { text: 'async', x: '90%', y: '32%', size: 'text-2xl', color: MONOKAI.pink, opacity: 0.07 },
    { text: 'font.sans', x: '83%', y: '38%', size: 'text-lg', color: MONOKAI.yellow, opacity: 0.08 },
    { text: 'JS', x: '92%', y: '15%', size: 'text-6xl', color: MONOKAI.yellow, opacity: 0.06 },
    { text: 'design systems', x: '80%', y: '43%', size: 'text-xl', color: MONOKAI.cyan, opacity: 0.09 },

    // Middle left
    { text: 'export', x: '7%', y: '48%', size: 'text-3xl', color: MONOKAI.pink, opacity: 0.08 },
    { text: 'components', x: '4%', y: '55%', size: 'text-2xl', color: MONOKAI.green, opacity: 0.09 },
    { text: 'import', x: '11%', y: '62%', size: 'text-3xl', color: MONOKAI.pink, opacity: 0.07 },
    { text: 'border.radius', x: '5%', y: '68%', size: 'text-base', color: MONOKAI.orange, opacity: 0.08 },
    { text: 'props', x: '14%', y: '58%', size: 'text-2xl', color: MONOKAI.orange, opacity: 0.07 },

    // Middle right
    { text: 'default', x: '85%', y: '50%', size: 'text-3xl', color: MONOKAI.pink, opacity: 0.08 },
    { text: 'tokens', x: '90%', y: '57%', size: 'text-2xl', color: MONOKAI.purple, opacity: 0.09 },
    { text: 'shadow.lg', x: '83%', y: '63%', size: 'text-lg', color: MONOKAI.yellow, opacity: 0.07 },
    { text: 'await', x: '88%', y: '70%', size: 'text-2xl', color: MONOKAI.pink, opacity: 0.08 },

    // Bottom left
    { text: 'class', x: '6%', y: '75%', size: 'text-3xl', color: MONOKAI.cyan, opacity: 0.08 },
    { text: 'accessibility', x: '3%', y: '82%', size: 'text-xl', color: MONOKAI.green, opacity: 0.09 },
    { text: 'variables', x: '10%', y: '88%', size: 'text-2xl', color: MONOKAI.purple, opacity: 0.07 },
    { text: 'transition', x: '5%', y: '92%', size: 'text-base', color: MONOKAI.orange, opacity: 0.08 },

    // Bottom right
    { text: 'JSX', x: '85%', y: '78%', size: 'text-5xl', color: MONOKAI.yellow, opacity: 0.08 },
    { text: 'theme', x: '90%', y: '85%', size: 'text-3xl', color: MONOKAI.purple, opacity: 0.09 },
    { text: 'motion', x: '82%', y: '92%', size: 'text-2xl', color: MONOKAI.pink, opacity: 0.07 },

    // Center scattered
    { text: 'hooks', x: '35%', y: '20%', size: 'text-2xl', color: MONOKAI.green, opacity: 0.07 },
    { text: 'state', x: '45%', y: '15%', size: 'text-3xl', color: MONOKAI.cyan, opacity: 0.08 },
    { text: 'utils', x: '55%', y: '22%', size: 'text-2xl', color: MONOKAI.orange, opacity: 0.06 },
    { text: 'wcag', x: '65%', y: '18%', size: 'text-xl', color: MONOKAI.green, opacity: 0.08 },
    { text: 'responsive', x: '40%', y: '82%', size: 'text-xl', color: MONOKAI.cyan, opacity: 0.07 },
    { text: 'grid', x: '50%', y: '88%', size: 'text-2xl', color: MONOKAI.purple, opacity: 0.08 },
    { text: 'flex', x: '60%', y: '85%', size: 'text-2xl', color: MONOKAI.cyan, opacity: 0.07 },
    { text: 'scale', x: '70%', y: '90%', size: 'text-xl', color: MONOKAI.pink, opacity: 0.06 },
  ]

  return (
    <section
      ref={heroRef}
      className='relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden'
      style={{ backgroundColor: MONOKAI.background }}
    >
      {/* Mind map connection lines - SVG overlay */}
      <svg
        className='absolute inset-0 w-full h-full pointer-events-none'
        style={{ opacity: 0.15 }}
      >
        {/* Connection lines between related keywords */}
        {/* function → return */}
        <line x1='5%' y1='8%' x2='8%' y2='15%' stroke={MONOKAI.pink} strokeWidth='1' opacity='0.3' />
        <circle cx='5%' cy='8%' r='3' fill={MONOKAI.pink} opacity='0.5' />
        <circle cx='8%' cy='15%' r='3' fill={MONOKAI.pink} opacity='0.5' />

        {/* const → interface */}
        <line x1='3%' y1='22%' x2='12%' y2='12%' stroke={MONOKAI.cyan} strokeWidth='1' opacity='0.3' />
        <circle cx='3%' cy='22%' r='3' fill={MONOKAI.green} opacity='0.5' />
        <circle cx='12%' cy='12%' r='3' fill={MONOKAI.cyan} opacity='0.5' />

        {/* design → code */}
        <line x1='82%' y1='10%' x2='88%' y2='18%' stroke={MONOKAI.purple} strokeWidth='1' opacity='0.3' />
        <circle cx='82%' cy='10%' r='3' fill={MONOKAI.purple} opacity='0.5' />
        <circle cx='88%' cy='18%' r='3' fill={MONOKAI.cyan} opacity='0.5' />

        {/* dev → design systems */}
        <line x1='4%' y1='42%' x2='80%' y2='43%' stroke={MONOKAI.cyan} strokeWidth='1' opacity='0.2' strokeDasharray='4 4' />
        <circle cx='4%' cy='42%' r='3' fill={MONOKAI.purple} opacity='0.5' />
        <circle cx='80%' cy='43%' r='3' fill={MONOKAI.cyan} opacity='0.5' />

        {/* export → import */}
        <line x1='7%' y1='48%' x2='11%' y2='62%' stroke={MONOKAI.pink} strokeWidth='1' opacity='0.3' />
        <circle cx='7%' cy='48%' r='3' fill={MONOKAI.pink} opacity='0.5' />
        <circle cx='11%' cy='62%' r='3' fill={MONOKAI.pink} opacity='0.5' />

        {/* hooks → state */}
        <line x1='35%' y1='20%' x2='45%' y2='15%' stroke={MONOKAI.cyan} strokeWidth='1' opacity='0.3' />
        <circle cx='35%' cy='20%' r='3' fill={MONOKAI.green} opacity='0.5' />
        <circle cx='45%' cy='15%' r='3' fill={MONOKAI.cyan} opacity='0.5' />

        {/* components → tokens */}
        <line x1='4%' y1='55%' x2='90%' y2='57%' stroke={MONOKAI.purple} strokeWidth='1' opacity='0.15' strokeDasharray='4 4' />
        <circle cx='4%' cy='55%' r='3' fill={MONOKAI.green} opacity='0.5' />
        <circle cx='90%' cy='57%' r='3' fill={MONOKAI.purple} opacity='0.5' />

        {/* accessibility → wcag */}
        <line x1='3%' y1='82%' x2='65%' y2='18%' stroke={MONOKAI.green} strokeWidth='1' opacity='0.2' strokeDasharray='4 4' />
        <circle cx='3%' cy='82%' r='3' fill={MONOKAI.green} opacity='0.5' />
        <circle cx='65%' cy='18%' r='3' fill={MONOKAI.green} opacity='0.5' />
      </svg>

      {/* Background code keywords - DENSE with Monokai colors */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        {keywords.map((kw, i) => (
          <div
            key={i}
            className={`bg-keyword absolute font-mono ${kw.size}`}
            style={{
              left: kw.x,
              top: kw.y,
              color: kw.color,
              opacity: kw.opacity,
            }}
          >
            {kw.text}
          </div>
        ))}
      </div>

      {/* Subtle gradient mesh - NOT dominant */}
      <div className='absolute inset-0 opacity-10'>
        <div
          className='absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px]'
          style={{ backgroundColor: MONOKAI.cyan }}
        />
        <div
          className='absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]'
          style={{ backgroundColor: MONOKAI.purple }}
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
        <div className='mb-16 font-mono text-sm space-y-2 pt-8' style={{ color: `${MONOKAI.foreground}60` }}>
          <div className='flex items-center gap-2 opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]'>
            <span style={{ color: MONOKAI.green }}>❯</span>
            <span style={{ color: `${MONOKAI.foreground}70` }}>~/portfolio</span>
            <span style={{ color: MONOKAI.purple }}>on</span>
            <span style={{ color: MONOKAI.cyan }}>main</span>
            <span style={{ color: MONOKAI.yellow }}>✓</span>
          </div>
          <div className='flex items-center gap-2 opacity-0 animate-[fadeIn_0.8s_ease-out_0.4s_forwards]'>
            <span style={{ color: MONOKAI.green }}>❯</span>
            <span style={{ color: `${MONOKAI.foreground}90` }}>whoami</span>
            <span className='inline-block w-2 h-4 ml-1 animate-pulse' style={{ backgroundColor: `${MONOKAI.foreground}60` }} />
          </div>
        </div>

        {/* NAME - Clean, powerful, with kinetic hover effect */}
        <div ref={nameBoxRef} className='mb-6 opacity-0'>
          <h1
            className='text-[clamp(64px,10vw,140px)] leading-[0.9] font-mono tracking-[-0.02em]'
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
          <span style={{ color: MONOKAI.orange, letterSpacing: '0.02em' }}>Senior Frontend Engineer</span> who builds{' '}
          <span style={{ color: MONOKAI.green }}>accessible</span>{' '}
          <span style={{ color: MONOKAI.purple }}>design systems</span> and{' '}
          <span style={{ color: MONOKAI.cyan }}>React</span> component libraries that teams actually want to use.
        </p>

        {/* BIO - clean text, no inline pills */}
        <div className='hero-bio relative mb-10 opacity-0'>
          <p
            className='text-[clamp(15px,1.6vw,18px)] leading-relaxed max-w-4xl font-mono'
            style={{ color: `${MONOKAI.foreground}99` }}
          >
            At <span style={{ color: MONOKAI.foreground }}>GM</span>, I architected Aurora serving 4 brands with{' '}
            <span style={{ color: MONOKAI.yellow }}>60% component reuse</span> and WCAG 2.2 AA compliance.
            I ship open-source with real adoption:{' '}
            <span style={{ color: MONOKAI.cyan }}>a11y Companion</span> (200+ users),{' '}
            <span style={{ color: MONOKAI.purple }}>FigmaVars Hooks</span>,{' '}
            <span style={{ color: MONOKAI.pink }}>Diabetic Utils</span>.
          </p>
        </div>

        {/* CTAs - Premium buttons with Monokai gradient effects */}
        <div className='hero-ctas flex flex-wrap items-center gap-4 mb-14 opacity-0'>
          {/* Primary CTA - White default, animated Monokai gradient on hover */}
          <button
            onClick={() => {
              const workSection = document.getElementById('work')
              if (workSection) {
                workSection.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className='group relative px-8 py-4 font-mono text-base font-bold rounded-xl overflow-hidden transition-all duration-300'
            style={{
              backgroundColor: MONOKAI.foreground,
              color: MONOKAI.background,
            }}
          >
            {/* Animated gradient overlay - appears on hover */}
            <div
              className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
              style={{
                background: `linear-gradient(90deg, ${MONOKAI.pink}, ${MONOKAI.orange}, ${MONOKAI.yellow}, ${MONOKAI.green}, ${MONOKAI.cyan}, ${MONOKAI.purple}, ${MONOKAI.pink})`,
                backgroundSize: '200% 100%',
                animation: 'gradient-x 3s ease infinite',
              }}
            />
            <span className='relative z-10 flex items-center gap-2.5'>
              View Work
              <svg
                className='w-4 h-4 transform group-hover:translate-y-0.5 transition-transform duration-300'
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
          </button>

          {/* GitHub button - glow on hover */}
          <a
            href='https://github.com/marklearst'
            target='_blank'
            rel='noopener noreferrer'
            className='group px-8 py-4 font-mono text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105'
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${MONOKAI.foreground}40`,
              color: MONOKAI.foreground,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = MONOKAI.cyan
              e.currentTarget.style.boxShadow = `0 0 20px ${MONOKAI.cyan}40, 0 0 40px ${MONOKAI.cyan}20`
              e.currentTarget.style.color = MONOKAI.cyan
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${MONOKAI.foreground}40`
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.color = MONOKAI.foreground
            }}
          >
            <span className='flex items-center gap-2.5'>
              <svg
                className='w-5 h-5 transition-transform duration-300 group-hover:rotate-12'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
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

        {/* Badges - Correct order: Design Systems, React, WCAG, Open Source, Dev Tools, Health Tech */}
        <div className='flex flex-wrap gap-3 font-mono text-sm'>
          <span
            className='hero-badge px-4 py-2.5 rounded-lg font-medium opacity-0 transition-all duration-300 hover:scale-105'
            style={{
              backgroundColor: `${MONOKAI.cyan}20`,
              color: MONOKAI.cyan,
              border: `1px solid ${MONOKAI.cyan}40`,
            }}
          >
            Design Systems
          </span>

          <span
            className='hero-badge px-4 py-2.5 rounded-lg font-medium opacity-0 transition-all duration-300 hover:scale-105'
            style={{
              backgroundColor: `${MONOKAI.purple}20`,
              color: MONOKAI.purple,
              border: `1px solid ${MONOKAI.purple}40`,
            }}
          >
            React • TypeScript
          </span>

          <span
            className='hero-badge px-4 py-2.5 rounded-lg font-medium opacity-0 transition-all duration-300 hover:scale-105'
            style={{
              backgroundColor: `${MONOKAI.yellow}20`,
              color: MONOKAI.yellow,
              border: `1px solid ${MONOKAI.yellow}40`,
            }}
          >
            WCAG • A11y
          </span>

          <span
            className='hero-badge px-4 py-2.5 rounded-lg font-medium opacity-0 transition-all duration-300 hover:scale-105'
            style={{
              backgroundColor: `${MONOKAI.pink}20`,
              color: MONOKAI.pink,
              border: `1px solid ${MONOKAI.pink}40`,
            }}
          >
            Open Source
          </span>

          <span
            className='hero-badge px-4 py-2.5 rounded-lg font-medium opacity-0 transition-all duration-300 hover:scale-105'
            style={{
              backgroundColor: `${MONOKAI.orange}20`,
              color: MONOKAI.orange,
              border: `1px solid ${MONOKAI.orange}40`,
            }}
          >
            Developer Tools
          </span>

          <span
            className='hero-badge px-4 py-2.5 rounded-lg font-medium opacity-0 transition-all duration-300 hover:scale-105'
            style={{
              backgroundColor: `${MONOKAI.green}20`,
              color: MONOKAI.green,
              border: `1px solid ${MONOKAI.green}40`,
            }}
          >
            Health Tech
          </span>
        </div>
      </div>

    </section>
  )
}
