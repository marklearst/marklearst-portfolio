'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function EnhancedHero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title character reveal - set initial state
      if (titleRef.current) {
        const text = 'marklearst'
        titleRef.current.innerHTML = text
          .split('')
          .map(
            (char) =>
              `<span class="inline-block opacity-0 translate-y-12">${char}</span>`,
          )
          .join('')

        gsap.to(titleRef.current.children, {
          opacity: 1,
          y: 0,
          duration: 1.4,
          stagger: {
            amount: 0.6,
            ease: 'power4.out',
          },
          ease: 'expo.out',
          delay: 0.5,
        })
      }

      // Floating particles with complex movement
      gsap.utils
        .toArray<HTMLElement>('.float-particle')
        .forEach((particle, i) => {
          const speed = gsap.utils.random(6, 12)
          const rotate = gsap.utils.random(-360, 360)
          const scale = gsap.utils.random(0.85, 1.15)
          const delay = i * 0.05

          gsap.to(particle, {
            y: `random(-40, 40)`,
            x: `random(-30, 30)`,
            rotation: rotate,
            scale: scale,
            duration: speed,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: delay,
          })
        })

      // Content orchestration - set initial state before animating
      gsap.set('.hero-description', { opacity: 0, y: 50 })
      gsap.set('.hero-bio', { opacity: 0, y: 40 })
      gsap.set('.hero-ctas', { opacity: 0, y: 30 })
      gsap.set('.hero-badge', { opacity: 0, scale: 0.8, y: 20 })

      const timeline = gsap.timeline({ delay: 1.5 })
      timeline
        .to('.hero-description', {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'expo.out',
        })
        .to(
          '.hero-bio',
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'expo.out',
          },
          '-=0.6',
        )
        .to(
          '.hero-ctas',
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'expo.out',
          },
          '-=0.5',
        )
        .to(
          '.hero-badge',
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'back.out(1.7)',
          },
          '-=0.4',
        )

      // Scroll indicator
      gsap.to('.scroll-indicator', {
        y: 10,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  // Ultra-smooth magnetic effect
  const createMagnetic = (strength: number = 0.5) => ({
    onMouseMove: (e: React.MouseEvent<HTMLAnchorElement>) => {
      const btn = e.currentTarget
      const rect = btn.getBoundingClientRect()
      const x = (e.clientX - (rect.left + rect.width / 2)) * strength
      const y = (e.clientY - (rect.top + rect.height / 2)) * strength

      gsap.to(btn, {
        x,
        y,
        duration: 0.3,
        ease: 'power2.out',
      })
    },
    onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => {
      gsap.to(e.currentTarget, {
        x: 0,
        y: 0,
        duration: 0.9,
        ease: 'elastic.out(1, 0.3)',
      })
    },
  })

  const primaryMagnetic = createMagnetic(0.45)
  const secondaryMagnetic = createMagnetic(0.35)

  return (
    <section
      ref={heroRef}
      className='relative min-h-screen flex items-center justify-center px-6 overflow-hidden'
    >
      {/* ULTRA ATMOSPHERIC BACKGROUND */}
      <div className='absolute inset-0'>
        {/* Gradient mesh layers */}
        <div className='absolute inset-0 opacity-40'>
          <div className='absolute top-[10%] left-[15%] w-[700px] h-[700px] bg-cyan-500/15 rounded-full blur-[140px] animate-[pulse_12s_ease-in-out_infinite]' />
          <div className='absolute bottom-[5%] right-[20%] w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[120px] animate-[pulse_15s_ease-in-out_infinite_2s]' />
          <div className='absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-teal-500/12 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite_4s]' />
          <div className='absolute bottom-[30%] left-[25%] w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[110px] animate-[pulse_14s_ease-in-out_infinite_1s]' />
        </div>

        {/* Grid with depth */}
        <div
          className='absolute inset-0 opacity-[0.02]'
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1.5px, transparent 1.5px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1.5px, transparent 1.5px)
            `,
            backgroundSize: '100px 100px',
            transform: 'perspective(1000px) rotateX(60deg) scale(2)',
            transformOrigin: 'center top',
          }}
        />

        {/* Film grain */}
        <div
          className='absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* FLOATING CODE SNIPPETS & ICONS - MASSIVELY ENHANCED */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        {/* Code snippets with syntax highlighting */}
        {[
          {
            code: 'const design = () =>',
            color: 'text-cyan-400',
            x: '8%',
            y: '12%',
            size: 'text-sm',
          },
          {
            code: '{  code + craft  }',
            color: 'text-cyan-300/70',
            x: '10%',
            y: '16%',
            size: 'text-xs',
          },
          {
            code: 'interface Developer {',
            color: 'text-purple-400',
            x: '85%',
            y: '15%',
            size: 'text-sm',
          },
          {
            code: '  vision: "pixel perfect"',
            color: 'text-green-400/80',
            x: '83%',
            y: '19%',
            size: 'text-xs',
          },
          {
            code: '}',
            color: 'text-purple-400',
            x: '85%',
            y: '22%',
            size: 'text-sm',
          },
          {
            code: '// Build systems',
            color: 'text-white/20',
            x: '5%',
            y: '75%',
            size: 'text-xs',
          },
          {
            code: '// that scale',
            color: 'text-white/15',
            x: '7%',
            y: '78%',
            size: 'text-xs',
          },
          {
            code: 'export default',
            color: 'text-blue-400',
            x: '88%',
            y: '70%',
            size: 'text-sm',
          },
          {
            code: '  excellence',
            color: 'text-blue-300/70',
            x: '87%',
            y: '73%',
            size: 'text-xs',
          },
          {
            code: '<Component>',
            color: 'text-yellow-400/70',
            x: '15%',
            y: '45%',
            size: 'text-sm',
          },
          {
            code: '  accessible',
            color: 'text-yellow-300/50',
            x: '16%',
            y: '48%',
            size: 'text-xs',
          },
          {
            code: '</Component>',
            color: 'text-yellow-400/70',
            x: '15%',
            y: '51%',
            size: 'text-sm',
          },
          {
            code: 'function create()',
            color: 'text-pink-400/80',
            x: '82%',
            y: '40%',
            size: 'text-sm',
          },
          {
            code: 'TypeScript',
            color: 'text-blue-500/60',
            x: '12%',
            y: '30%',
            size: 'text-[11px]',
          },
          {
            code: 'React 19',
            color: 'text-cyan-500/60',
            x: '88%',
            y: '55%',
            size: 'text-[11px]',
          },
          {
            code: 'WCAG 2.1 AAA',
            color: 'text-green-500/60',
            x: '10%',
            y: '60%',
            size: 'text-[11px]',
          },
        ].map((snippet, i) => (
          <div
            key={`code-${i}`}
            className={`float-particle absolute ${snippet.color} ${snippet.size} font-mono opacity-15 hover:opacity-30 transition-opacity duration-500`}
            style={{ left: snippet.x, top: snippet.y }}
          >
            {snippet.code}
          </div>
        ))}

        {/* Design tokens */}
        {[
          {
            label: 'spacing.2xl',
            color: 'text-cyan-400',
            x: '12%',
            y: '20%',
            icon: '⟷',
          },
          {
            label: 'color.primary',
            color: 'text-purple-400',
            x: '78%',
            y: '25%',
            icon: '◉',
          },
          {
            label: 'font.display',
            color: 'text-green-400',
            x: '20%',
            y: '68%',
            icon: 'Aa',
          },
          {
            label: 'radius.xl',
            color: 'text-yellow-400',
            x: '75%',
            y: '62%',
            icon: '◠',
          },
          {
            label: 'shadow.lg',
            color: 'text-pink-400',
            x: '30%',
            y: '38%',
            icon: '▦',
          },
          {
            label: 'opacity.90',
            color: 'text-blue-400',
            x: '65%',
            y: '35%',
            icon: '◐',
          },
          {
            label: 'transition',
            color: 'text-teal-400',
            x: '45%',
            y: '18%',
            icon: '⟿',
          },
          {
            label: 'z-index.modal',
            color: 'text-orange-400',
            x: '38%',
            y: '72%',
            icon: '⬚',
          },
          {
            label: 'duration.fast',
            color: 'text-red-400/70',
            x: '55%',
            y: '80%',
            icon: '⚡',
          },
          {
            label: 'easing.bounce',
            color: 'text-violet-400/70',
            x: '70%',
            y: '50%',
            icon: '∿',
          },
        ].map((token, i) => (
          <div
            key={`token-${i}`}
            className={`float-particle absolute ${token.color} opacity-12 hover:opacity-25 transition-all duration-700 cursor-default`}
            style={{ left: token.x, top: token.y }}
          >
            <div className='flex items-center gap-2 text-xs font-mono'>
              <span className='text-base opacity-60'>{token.icon}</span>
              <span>{token.label}</span>
            </div>
          </div>
        ))}

        {/* Geometric shapes with better variety */}
        {[...Array(20)].map((_, i) => {
          const shapes = [
            'w-20 h-20 rounded-full border-2 border-white/8',
            'w-16 h-16 rotate-45 border-2 border-white/6',
            'w-14 h-14 rounded-lg border border-white/8',
            'w-12 h-16 rounded-full border border-white/5',
            'w-18 h-8 rounded-full border border-white/7',
            'w-10 h-10 rounded border-2 border-white/6',
          ]
          return (
            <div
              key={`shape-${i}`}
              className='float-particle absolute opacity-[0.06]'
              style={{
                left: `${8 + i * 4.5}%`,
                top: `${15 + (i % 5) * 15}%`,
              }}
            >
              <div className={shapes[i % shapes.length]} />
            </div>
          )
        })}

        {/* Icon glyphs */}
        {[
          { icon: '⌘', x: '25%', y: '25%', size: 'text-2xl' },
          { icon: '⌥', x: '72%', y: '45%', size: 'text-xl' },
          { icon: '⇧', x: '15%', y: '55%', size: 'text-2xl' },
          { icon: '⌃', x: '80%', y: '82%', size: 'text-xl' },
          { icon: '⎋', x: '35%', y: '82%', size: 'text-lg' },
          { icon: '↵', x: '62%', y: '20%', size: 'text-xl' },
          { icon: '⌫', x: '48%', y: '88%', size: 'text-lg' },
          { icon: '⇥', x: '92%', y: '35%', size: 'text-2xl' },
        ].map((glyph, i) => (
          <div
            key={`glyph-${i}`}
            className={`float-particle absolute text-white/8 ${glyph.size} font-mono hover:text-white/15 transition-colors duration-700`}
            style={{ left: glyph.x, top: glyph.y }}
          >
            {glyph.icon}
          </div>
        ))}
      </div>

      {/* Version */}
      <div className='absolute top-8 right-8 font-mono text-[10px] text-white/25 tracking-widest backdrop-blur-md border border-white/5 px-3 py-2 rounded-full hover:border-white/10 hover:text-white/40 transition-all duration-500'>
        v2025.1.0
      </div>

      {/* Main Content */}
      <div className='max-w-6xl w-full relative z-10'>
        {/* Terminal */}
        <div className='mb-20 font-mono text-sm text-white/35 space-y-2'>
          <div className='flex items-center gap-2 opacity-0 animate-[fadeIn_1s_ease-out_0.3s_forwards]'>
            <span className='text-green-400/80'>❯</span>
            <span className='text-white/45'>~/portfolio</span>
            <span className='text-purple-400/50'>on</span>
            <span className='text-cyan-400/70'>main</span>
            <span className='text-yellow-400/40'>✓</span>
          </div>
          <div className='flex items-center gap-2 opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]'>
            <span className='text-green-400/80'>❯</span>
            <span className='text-white/55'>whoami</span>
            <span className='inline-block w-2 h-4 bg-white/35 ml-1 animate-pulse' />
          </div>
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className='text-[clamp(80px,12vw,200px)] leading-[0.85] mb-14 tracking-[-0.02em] font-mono whitespace-nowrap'
          style={{ fontWeight: 700 }}
        >
          marklearst
        </h1>

        {/* Description */}
        <p className='hero-description text-[clamp(26px,3.8vw,48px)] leading-tight text-white/95 mb-10 max-w-5xl font-light'>
          Principal IC Design Engineer building design systems, developer tools,
          and health tech products.
        </p>

        {/* Bio */}
        <div className='hero-bio relative mb-16'>
          <div className='flex items-start gap-4'>
            <span className='text-white/15 font-mono text-xl select-none mt-1.5 tracking-tight'>
              {'//'}
            </span>
            <p className='text-[clamp(18px,2.2vw,24px)] text-white/65 leading-relaxed max-w-3xl'>
              Remote-first engineer specializing in design systems, developer
              tooling, and health tech. Currently building Variable Contract and
              GlucoseIQ.
            </p>
          </div>
        </div>

        {/* INSANE BUTTON REDESIGN */}
        <div className='hero-ctas flex flex-wrap gap-5 mb-16'>
          {/* Primary CTA - Holographic effect */}
          <a
            href='#work'
            className='group relative px-10 py-5 font-medium rounded-2xl overflow-hidden will-change-transform'
            {...primaryMagnetic}
          >
            {/* Animated gradient background */}
            <div className='absolute inset-0 bg-linear-to-r from-white via-gray-50 to-white' />

            {/* Holographic shimmer */}
            <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700'>
              <div className='absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 skew-x-12' />
            </div>

            {/* Glow effect */}
            <div className='absolute -inset-1 bg-linear-to-r from-cyan-500/20 via-white/30 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 -z-10' />

            <span className='relative z-10 flex items-center gap-3 text-black font-mono text-base'>
              <span className='relative'>
                View Work
                <span className='absolute -bottom-0.5 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-500' />
              </span>
              <svg
                className='w-5 h-5 transform group-hover:translate-x-1.5 group-hover:scale-110 transition-all duration-300'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M13 7l5 5m0 0l-5 5m5-5H6'
                />
              </svg>
            </span>
          </a>

          {/* Secondary CTA - Glass morphism with particle effect */}
          <a
            href='https://github.com/marklearst'
            target='_blank'
            rel='noopener noreferrer'
            className='group relative px-10 py-5 font-medium rounded-2xl overflow-hidden will-change-transform'
            {...secondaryMagnetic}
          >
            {/* Glass background */}
            <div className='absolute inset-0 bg-white/3 backdrop-blur-2xl border-2 border-white/10 group-hover:border-white/25 group-hover:bg-white/6 transition-all duration-700' />

            {/* Animated border gradient */}
            <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700'>
              <div className='absolute inset-[-2px] bg-linear-to-r from-cyan-500/30 via-purple-500/30 to-teal-500/30 rounded-2xl blur-sm -z-10 animate-[spin_8s_linear_infinite]' />
            </div>

            {/* Particle effect on hover */}
            <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500'>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className='absolute w-1 h-1 bg-white/40 rounded-full animate-[particle_2s_ease-out_infinite]'
                  style={{
                    left: `${20 + i * 15}%`,
                    top: '50%',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>

            <span className='relative z-10 flex items-center gap-3.5 text-white/90 font-mono text-base'>
              <svg
                className='w-6 h-6 group-hover:rotate-360 transition-transform duration-1000'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  fillRule='evenodd'
                  d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='relative'>
                GitHub
                <span className='absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-500' />
              </span>
            </span>
          </a>
        </div>

        {/* Badges */}
        <div className='flex flex-wrap gap-3 font-mono text-[13px]'>
          {[
            {
              label: 'Design Systems',
              gradient: 'from-teal-500/25 to-cyan-500/25',
              text: 'text-teal-200',
              border: 'border-teal-400/40',
            },
            {
              label: 'React • TypeScript',
              gradient: 'from-purple-500/25 to-pink-500/25',
              text: 'text-purple-200',
              border: 'border-purple-400/40',
            },
            {
              label: 'Health Tech',
              gradient: 'from-green-500/25 to-emerald-500/25',
              text: 'text-green-200',
              border: 'border-green-400/40',
            },
            {
              label: 'WCAG • A11y',
              gradient: 'from-blue-500/25 to-indigo-500/25',
              text: 'text-blue-200',
              border: 'border-blue-400/40',
            },
            {
              label: 'Developer Tools',
              gradient: 'from-orange-500/25 to-red-500/25',
              text: 'text-orange-200',
              border: 'border-orange-400/40',
            },
            {
              label: 'Open Source',
              gradient: 'from-yellow-500/25 to-amber-500/25',
              text: 'text-yellow-200',
              border: 'border-yellow-400/40',
            },
          ].map((badge, i) => (
            <span
              key={i}
              className={`
                hero-badge group relative px-4 py-2.5 rounded-xl backdrop-blur-sm
                border ${badge.border} ${badge.text}
                bg-linear-to-br ${badge.gradient}
                hover:scale-105 hover:-translate-y-0.5 transition-all duration-300
                shadow-lg hover:shadow-xl cursor-default
              `}
            >
              {badge.label}
              <div className='absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            </span>
          ))}
        </div>
      </div>

      {/* Scroll */}
      <div className='scroll-indicator absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30 hover:opacity-50 transition-opacity duration-500'>
        <span className='font-mono text-[9px] uppercase tracking-[0.3em] text-white/60'>
          Scroll
        </span>
        <div className='relative w-7 h-11 border-2 border-white/20 rounded-full p-2'>
          <div className='w-1.5 h-2.5 bg-white/50 rounded-full mx-auto animate-[scroll_2.5s_ease-in-out_infinite]' />
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll {
          0% {
            opacity: 0;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
          }
          80% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 0;
            transform: translateY(12px);
          }
        }

        @keyframes particle {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(
                var(--tw-translate-x, 40px),
                var(--tw-translate-y, -40px)
              )
              scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  )
}
