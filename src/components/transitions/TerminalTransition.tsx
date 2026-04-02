'use client'

import { useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import { MONOKAI } from '@/lib/monokai-colors'
import {
  typeText,
  animateProgressBar,
  showPackages,
} from '@/lib/terminal-animation'
import { getCommandForRoute } from '@/lib/terminal-commands'
import { DURATION } from '@/lib/terminal-timing'

interface TerminalTransitionProps {
  isActive: boolean
  targetRoute: string
  transitionKey: number
  shouldExit?: boolean
  onComplete?: (key: number) => void
}

export default function TerminalTransition({
  isActive,
  targetRoute,
  transitionKey,
  shouldExit = false,
  onComplete,
}: TerminalTransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentWrapperRef = useRef<HTMLDivElement>(null)
  const commandRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  const packagesRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  const exitTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const hasExitRef = useRef(false)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    hasExitRef.current = false
    if (exitTimelineRef.current) {
      exitTimelineRef.current.kill()
      exitTimelineRef.current = null
    }
  }, [transitionKey])

  // Derive command from targetRoute using useMemo (no state needed)
  const command = useMemo(() => {
    return targetRoute ? getCommandForRoute(targetRoute) : null
  }, [targetRoute])

  useEffect(() => {
    if (!isActive || !targetRoute || !command) return

    const cmd = command

    if (commandRef.current) {
      commandRef.current.textContent = ''
    }
    if (loadingRef.current) {
      loadingRef.current.textContent = ''
    }
    if (packagesRef.current) {
      packagesRef.current.innerHTML = ''
    }
    if (outputRef.current) {
      outputRef.current.textContent = ''
    }
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%'
    }

    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(contentWrapperRef.current, {
      opacity: 0,
      y: 18,
      scale: 0.98,
    })

    const master = gsap.timeline()

    // 1. Show overlay with faster fade-in
    master.to(overlayRef.current, {
      opacity: 1,
      duration: DURATION.overlayFadeIn,
      ease: 'power2.out',
    })

    // 2. Bring in content wrapper
    master.to(
      contentWrapperRef.current,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: DURATION.overlayContentIn,
        ease: 'power3.out',
      },
      '-=0.05',
    )

    // 3. Type command
    if (commandRef.current) {
      master.add(
        typeText({
          element: commandRef.current,
          text: cmd.command,
          cursor: true,
        }),
        '+=0.05',
      )
    }

    // 4. Show loading text if exists
    if (cmd.loading && loadingRef.current) {
      master.fromTo(
        loadingRef.current,
        { opacity: 0, y: 5 },
        {
          opacity: 1,
          y: 0,
          duration: DURATION.loadingFadeIn,
          ease: 'power2.out',
          onStart: () => {
            if (loadingRef.current) {
              loadingRef.current.textContent = cmd.loading || ''
            }
          },
        },
      )
    }

    // 5. Show progress bar
    if (progressBarRef.current) {
      master.add(
        animateProgressBar(progressBarRef.current, DURATION.progressBar),
        '-=0.2',
      )
    }

    // 6. Show packages if exists
    if (cmd.packages && cmd.packages.length > 0 && packagesRef.current) {
      master.add(
        showPackages(
          packagesRef.current,
          cmd.packages,
          DURATION.packageStagger,
        ),
        '-=0.4',
      )
    }

    // 7. Show output/success message
    if (cmd.output && outputRef.current) {
      master.call(() => {
        if (outputRef.current) {
          outputRef.current.textContent = cmd.output || ''
          // Set color to match project color for branding consistency
          const outputColor = cmd.color || MONOKAI.terminal.success
          outputRef.current.style.color = outputColor
        }
      }, [])

      // Animate output reveal (this blocks the timeline)
      master.fromTo(
        outputRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: DURATION.outputReveal,
          ease: 'back.out(1.7)',
        },
      )
    }

    // 8. Hold briefly then trigger navigation
    // Use longer hold time for home route (whoami) to let user see the output
    const defaultHold =
      targetRoute === '/' ? DURATION.holdBeforeNavHome : DURATION.holdBeforeNav
    const minHold = cmd.duration
      ? Math.max(0, cmd.duration / 1000 - master.duration())
      : 0
    const holdDuration = Math.max(defaultHold, minHold)
    master.to({}, { duration: holdDuration })

    // 9. Trigger navigation while overlay is still visible
    master.call(() => {
      if (onCompleteRef.current) onCompleteRef.current(transitionKey)
    })

    return () => {
      master.kill()
    }
  }, [command, isActive, targetRoute, transitionKey])

  useEffect(() => {
    if (!isActive || !shouldExit || hasExitRef.current) return
    hasExitRef.current = true

    const exitTimeline = gsap.timeline()
    exitTimeline.to({}, { duration: DURATION.navDelay / 1000 })
    exitTimeline.to(
      contentWrapperRef.current,
      {
        opacity: 0,
        y: -12,
        scale: 0.98,
        duration: DURATION.overlayContentOut,
        ease: 'power2.in',
      },
      '<',
    )
    exitTimeline.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: DURATION.overlayFadeOut,
        ease: 'power2.in',
      },
      '<',
    )

    exitTimelineRef.current = exitTimeline

    return () => {
      exitTimeline.kill()
    }
  }, [isActive, shouldExit, transitionKey])

  if (!isActive) return null

  return (
    <div
      ref={overlayRef}
      className='fixed inset-0 z-9999 flex items-center justify-center pointer-events-none'
      style={{
        backgroundColor: MONOKAI.background,
        opacity: 0,
      }}
    >
      {/* Terminal content */}
      <div
        ref={contentWrapperRef}
        className='relative w-full max-w-3xl px-8 font-mono text-base'
      >
        {/* Command line */}
        <div
          ref={commandRef}
          className='mb-4 font-mono text-lg tracking-wide'
          style={{
            color: MONOKAI.foreground,
          }}
        />

        {/* Loading text */}
        {command?.loading && (
          <div
            ref={loadingRef}
            className='mb-3 text-sm opacity-0'
            style={{
              color: MONOKAI.terminal.comment,
            }}
          />
        )}

        {/* Progress bar */}
        <div
          className='h-1 mb-6 rounded-full overflow-hidden'
          style={{
            backgroundColor: MONOKAI.backgroundAlt,
          }}
        >
          <div
            ref={progressBarRef}
            className='h-full rounded-full'
            style={{
              backgroundColor: command?.color || MONOKAI.terminal.success,
              width: '0%',
            }}
          />
        </div>

        {/* Packages list */}
        {command?.packages && command.packages.length > 0 && (
          <div ref={packagesRef} className='mb-4 space-y-1 text-sm font-mono' />
        )}

        {/* Output/success message */}
        {command?.output && (
          <div
            ref={outputRef}
            className='text-base font-mono font-semibold opacity-0'
            style={{
              color: MONOKAI.terminal.success,
            }}
          />
        )}
      </div>

      {/* Gradient mesh background */}
      <div className='absolute inset-0 opacity-20 pointer-events-none'>
        <div
          className='absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-[120px]'
          style={{
            backgroundColor: MONOKAI.cyan + '40',
          }}
        />
        <div
          className='absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full blur-[100px]'
          style={{
            backgroundColor: MONOKAI.purple + '40',
          }}
        />
      </div>
    </div>
  )
}
