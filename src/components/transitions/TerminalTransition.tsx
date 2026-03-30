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
  onComplete?: () => void
}

export default function TerminalTransition({
  isActive,
  targetRoute,
  onComplete,
}: TerminalTransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const commandRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  const packagesRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Derive command from targetRoute using useMemo (no state needed)
  const command = useMemo(() => {
    return targetRoute ? getCommandForRoute(targetRoute) : null
  }, [targetRoute])

  useEffect(() => {
    if (!isActive || !targetRoute || !command) return

    const cmd = command

    const master = gsap.timeline()

    // 1. Show overlay with faster fade-in
    master.to(overlayRef.current, {
      opacity: 1,
      duration: DURATION.overlayFadeIn,
      ease: 'power2.out',
    })

    // 2. Type command
    if (commandRef.current) {
      master.add(
        typeText({
          element: commandRef.current,
          text: cmd.command,
          cursor: true,
        }),
      )
    }

    // 3. Show loading text if exists
    if (cmd.loading && loadingRef.current) {
      master.call(() => {
        if (loadingRef.current) {
          loadingRef.current.textContent = cmd.loading || ''
          gsap.fromTo(
            loadingRef.current,
            { opacity: 0, y: 5 },
            { opacity: 1, y: 0, duration: DURATION.loadingFadeIn },
          )
        }
      })
    }

    // 4. Show progress bar
    if (progressBarRef.current) {
      master.add(
        animateProgressBar(progressBarRef.current, DURATION.progressBar),
        '-=0.2',
      )
    }

    // 5. Show packages if exists
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

    // 6. Show output/success message
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

    // 7. Hold briefly then trigger navigation
    // Use longer hold time for home route (whoami) to let user see the output
    const holdDuration =
      targetRoute === '/' ? DURATION.holdBeforeNavHome : DURATION.holdBeforeNav
    master.to({}, { duration: holdDuration })

    // 8. Trigger navigation while overlay is still visible
    master.call(() => {
      if (onCompleteRef.current) onCompleteRef.current()
    })

    // 9. Keep overlay visible a bit longer for smooth transition
    master.to({}, { duration: DURATION.navDelay / 1000 })

    return () => {
      master.kill()
    }
  }, [command, isActive, targetRoute])

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
      <div className='w-full max-w-3xl px-8 font-mono text-base'>
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
