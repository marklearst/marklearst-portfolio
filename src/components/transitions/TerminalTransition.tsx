'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { MONOKAI } from '@/lib/monokai-colors'
import {
  typeText,
  animateProgressBar,
  showPackages,
} from '@/lib/terminal-animation'
import { getCommandForRoute, type TerminalCommand } from '@/lib/terminal-commands'

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

  const [command, setCommand] = useState<TerminalCommand | null>(null)

  useEffect(() => {
    if (!isActive || !targetRoute) return

    const cmd = getCommandForRoute(targetRoute)
    setCommand(cmd)

    const master = gsap.timeline({
      onComplete: () => {
        // Short buffer before triggering navigation
        setTimeout(() => {
          // Trigger navigation - overlay stays visible until new page loads
          if (onComplete) onComplete()
        }, 300)
      },
    })

    // 1. Show overlay with faster fade-in
    master.to(overlayRef.current, {
      opacity: 1,
      duration: 0.2, // Reduced from 0.3s
      ease: 'power2.out',
    })

    // 2. Type command
    if (commandRef.current) {
      master.add(
        typeText({
          element: commandRef.current,
          text: cmd.command,
          minSpeed: 60,
          maxSpeed: 100,
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
            { opacity: 1, y: 0, duration: 0.3 },
          )
        }
      })
    }

    // 4. Show progress bar
    if (progressBarRef.current) {
      master.add(animateProgressBar(progressBarRef.current, 0.8), '-=0.2')
    }

    // 5. Show packages if exists
    if (cmd.packages && cmd.packages.length > 0 && packagesRef.current) {
      master.add(
        showPackages(packagesRef.current, cmd.packages, 0.12),
        '-=0.4',
      )
    }

    // 6. Show output/success message
    if (cmd.output && outputRef.current) {
      master.call(() => {
        if (outputRef.current) {
          outputRef.current.textContent = cmd.output || ''
          gsap.fromTo(
            outputRef.current,
            { opacity: 0, scale: 0.95 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.4,
              ease: 'back.out(1.7)',
            },
          )
        }
      }, [])
    }

    // 7. Hold for a moment before hiding
    master.to({}, { duration: 0.3 })

    return () => {
      master.kill()
    }
  }, [isActive, targetRoute, onComplete])

  if (!isActive) return null

  return (
    <div
      ref={overlayRef}
      className='fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none'
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
              backgroundColor: MONOKAI.terminal.success,
              width: '0%',
            }}
          />
        </div>

        {/* Packages list */}
        {command?.packages && command.packages.length > 0 && (
          <div
            ref={packagesRef}
            className='mb-4 space-y-1 text-sm font-mono'
          />
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
