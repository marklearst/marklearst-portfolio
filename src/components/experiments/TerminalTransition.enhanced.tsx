'use client'

import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { MONOKAI } from '@/lib/monokai-colors'
import {
  typeText,
  animateProgressBar,
  showPackages,
} from '@/lib/terminal-animation'
import {
  getCommandForRoute,
  type TerminalCommand,
} from '@/lib/terminal-commands'

interface TerminalTransitionProps {
  isActive: boolean
  targetRoute: string
  onComplete?: () => void
}

export default function TerminalTransition({
  isActive,
  targetRoute,
  onComplete,
}: TerminalTransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentWrapperRef = useRef<HTMLDivElement>(null)
  const commandRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  const packagesRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const scanlineRef = useRef<HTMLDivElement>(null)

  const command = useMemo<TerminalCommand | null>(() => {
    if (!isActive || !targetRoute) return null
    return getCommandForRoute(targetRoute)
  }, [isActive, targetRoute])

  useEffect(() => {
    if (!isActive || !command) return

    const cmd = command

    const master = gsap.timeline({
      onComplete: () => {
        // Reduced buffer from 1000ms to 400ms
        setTimeout(() => {
          // Trigger navigation
          if (onComplete) onComplete()

          // Dramatic exit with slide down
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: 'power3.in',
          })
          gsap.to(contentWrapperRef.current, {
            y: 100,
            duration: 0.3,
            ease: 'power3.in',
          })
        }, 400) // Reduced from 1000ms
      },
    })

    // 1. Show overlay with faster fade-in (0.2s instead of 0.4s)
    master.to(overlayRef.current, {
      opacity: 1,
      duration: 0.2,
      ease: 'power2.out',
    })

    // 2. Slide up content wrapper with elastic ease
    master.fromTo(
      contentWrapperRef.current,
      {
        y: 80,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
      },
      '-=0.1',
    )

    // 3. Scanline sweep
    if (scanlineRef.current) {
      master.fromTo(
        scanlineRef.current,
        { top: '0%', opacity: 0.8 },
        {
          top: '100%',
          opacity: 0.3,
          duration: 1.2,
          ease: 'none',
          repeat: -1,
        },
        0,
      )
    }

    // 4. Type command with glitch effect
    if (commandRef.current) {
      const commandTimeline = typeText({
        element: commandRef.current,
        text: cmd.command,
        minSpeed: 50,
        maxSpeed: 90,
        cursor: true,
      })

      // Add glitch effect during typing
      commandTimeline.call(
        () => {
          if (commandRef.current && Math.random() > 0.7) {
            gsap.to(commandRef.current, {
              x: gsap.utils.random(-2, 2),
              duration: 0.05,
              repeat: 3,
              yoyo: true,
              onComplete: () => {
                gsap.set(commandRef.current, { x: 0 })
              },
            })
          }
        },
        [],
        '+=0.1',
      )

      master.add(commandTimeline, '+=0.2')
    }

    // 5. Show loading text with slide up
    if (cmd.loading && loadingRef.current) {
      master.fromTo(
        loadingRef.current,
        { opacity: 0, y: 10 },
        {
          opacity: 0.7,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          onStart: () => {
            if (loadingRef.current) {
              loadingRef.current.textContent = cmd.loading || ''
            }
          },
        },
        '-=0.2',
      )
    }

    // 6. Show progress bar
    if (progressBarRef.current) {
      master.add(animateProgressBar(progressBarRef.current, 0.7), '-=0.3')
    }

    // 7. Show packages with stagger
    if (cmd.packages && cmd.packages.length > 0 && packagesRef.current) {
      master.add(showPackages(packagesRef.current, cmd.packages, 0.08), '-=0.5')
    }

    // 8. Show output with scale bounce
    if (cmd.output && outputRef.current) {
      master.fromTo(
        outputRef.current,
        { opacity: 0, scale: 0.9, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: 'back.out(2)',
          onStart: () => {
            if (outputRef.current) {
              outputRef.current.textContent = cmd.output || ''
            }
          },
        },
        '-=0.2',
      )
    }

    // 9. Brief hold
    master.to({}, { duration: 0.2 })

    return () => {
      master.kill()
    }
  }, [isActive, command, onComplete])

  if (!isActive) return null

  return (
    <>
      {/* Main overlay with CRT effect */}
      <div
        ref={overlayRef}
        className='fixed inset-0 z-9999 flex items-center justify-center pointer-events-none'
        style={{
          backgroundColor: MONOKAI.background,
          opacity: 0,
        }}
      >
        {/* CRT screen curvature effect */}
        <div
          className='absolute inset-0'
          style={{
            background: `radial-gradient(ellipse at center, transparent 0%, ${MONOKAI.background}99 100%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Scanline effect */}
        <div
          ref={scanlineRef}
          className='absolute left-0 right-0 h-1 pointer-events-none'
          style={{
            background: `linear-gradient(to bottom, transparent, ${MONOKAI.cyan}40, transparent)`,
            filter: 'blur(1px)',
            top: '0%',
            opacity: 0,
          }}
        />

        {/* Horizontal scanlines (static) */}
        <div
          className='absolute inset-0 pointer-events-none opacity-[0.03]'
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              ${MONOKAI.foreground} 2px,
              ${MONOKAI.foreground} 3px
            )`,
          }}
        />

        {/* Content wrapper with slide-up */}
        <div
          ref={contentWrapperRef}
          className='w-full max-w-3xl px-8 relative'
          style={{
            opacity: 0,
            transform: 'translateY(80px)',
          }}
        >
          {/* Terminal chrome header */}
          <div className='mb-6 flex items-center gap-2 opacity-40'>
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: MONOKAI.pink }}
            />
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: MONOKAI.yellow }}
            />
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: MONOKAI.green }}
            />
            <div
              className='ml-3 text-xs font-mono'
              style={{ color: MONOKAI.foreground + '40' }}
            >
              terminal — {targetRoute}
            </div>
          </div>

          {/* Command line with chromatic aberration */}
          <div className='relative mb-6'>
            <div
              ref={commandRef}
              className='font-mono text-xl tracking-wide relative z-10'
              style={{
                color: MONOKAI.foreground,
                textShadow: `
                  1px 0 0 ${MONOKAI.pink}40,
                  -1px 0 0 ${MONOKAI.cyan}40,
                  0 0 8px ${MONOKAI.cyan}20
                `,
              }}
            />
          </div>

          {/* Loading text */}
          {command?.loading && (
            <div
              ref={loadingRef}
              className='mb-4 text-sm opacity-0 font-mono'
              style={{
                color: MONOKAI.foreground + '99',
              }}
            />
          )}

          {/* Progress bar with glow */}
          <div
            className='h-1 mb-6 rounded-full overflow-hidden relative'
            style={{
              backgroundColor: MONOKAI.backgroundAlt,
            }}
          >
            <div
              ref={progressBarRef}
              className='h-full rounded-full relative'
              style={{
                backgroundColor: MONOKAI.green,
                width: '0%',
                boxShadow: `0 0 12px ${MONOKAI.green}80`,
              }}
            />
          </div>

          {/* Packages list */}
          {command?.packages && command.packages.length > 0 && (
            <div
              ref={packagesRef}
              className='mb-5 space-y-1 text-sm font-mono'
            />
          )}

          {/* Output/success message with holographic effect */}
          {command?.output && (
            <div className='relative'>
              <div
                ref={outputRef}
                className='text-lg font-mono font-bold opacity-0 relative z-10'
                style={{
                  color: MONOKAI.green,
                  textShadow: `0 0 20px ${MONOKAI.green}60`,
                }}
              />
              {/* Holographic shimmer */}
              <div
                className='absolute inset-0 opacity-30 blur-xl'
                style={{
                  background: `linear-gradient(90deg, ${MONOKAI.cyan}00, ${MONOKAI.cyan}60, ${MONOKAI.purple}60, ${MONOKAI.cyan}00)`,
                }}
              />
            </div>
          )}
        </div>

        {/* Gradient mesh background with animation */}
        <div className='absolute inset-0 opacity-15 pointer-events-none'>
          <div
            className='absolute top-1/4 left-1/3 w-[700px] h-[700px] rounded-full blur-[140px] animate-pulse'
            style={{
              backgroundColor: MONOKAI.cyan,
              animationDuration: '4s',
            }}
          />
          <div
            className='absolute bottom-1/4 right-1/3 w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse'
            style={{
              backgroundColor: MONOKAI.purple,
              animationDuration: '5s',
              animationDelay: '1s',
            }}
          />
          <div
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse'
            style={{
              backgroundColor: MONOKAI.pink,
              animationDuration: '6s',
              animationDelay: '2s',
            }}
          />
        </div>

        {/* CRT glow effect */}
        <div
          className='absolute inset-0 pointer-events-none opacity-20'
          style={{
            background: `radial-gradient(ellipse at center, ${MONOKAI.cyan}10 0%, transparent 70%)`,
          }}
        />

        {/* Vignette */}
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            background: `radial-gradient(ellipse at center, transparent 30%, ${MONOKAI.background} 100%)`,
          }}
        />

        {/* Noise texture */}
        <div
          className='absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Screen flicker overlay */}
      <style jsx>{`
        @keyframes flicker {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.97;
          }
        }

        div[ref='overlayRef'] {
          animation: flicker 0.15s infinite;
        }
      `}</style>
    </>
  )
}
