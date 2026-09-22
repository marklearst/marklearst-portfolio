'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useRef, useState, type ReactNode } from 'react'
import TrackedLink from '@/components/analytics/TrackedLink'
import { ArrowRightIcon } from '@/components/ui/Icon'
import type { ComponentProps } from 'react'
import styles from './WorkFigure.module.css'

const MAX_SHIFT = 14

/** Early pointer travel maps louder; still clamped at MAX_SHIFT. */
function shiftFromPointer(normalized: number) {
  const magnitude = Math.min(1, Math.abs(normalized))
  const curved = 1 - (1 - magnitude) ** 1.45
  return Math.sign(normalized) * curved * MAX_SHIFT
}

type TrackEvent = ComponentProps<typeof TrackedLink>['event']

type WorkFigureProps = {
  className?: string
  href: string
  ariaLabel: string
  image: {
    src: string
    alt: string
    width: number
    height: number
    sizes: string
  }
  caption?: ReactNode
  compact?: boolean
  onClick?: () => void
  trackEvent?: TrackEvent
}

export default function WorkFigure({
  className,
  href,
  ariaLabel,
  image,
  caption,
  compact = false,
  onClick,
  trackEvent,
}: WorkFigureProps) {
  const viewportRef = useRef<HTMLSpanElement>(null)
  const settleTimer = useRef<number | null>(null)
  const shiftableRef = useRef(false)
  const [shift, setShift] = useState({ x: 0, y: 0 })
  const [settling, setSettling] = useState(false)

  const clearSettle = useCallback(() => {
    if (settleTimer.current !== null) {
      window.clearTimeout(settleTimer.current)
      settleTimer.current = null
    }
  }, [])

  const applyShift = useCallback((clientX: number, clientY: number) => {
    if (!shiftableRef.current || !viewportRef.current) return
    const rect = viewportRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const x = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width - 0.5) * 2))
    const y = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height - 0.5) * 2))
    setShift({ x: shiftFromPointer(x), y: shiftFromPointer(y) })
  }, [])

  const resetShift = useCallback(() => {
    clearSettle()
    shiftableRef.current = false
    setSettling(true)
    setShift({ x: 0, y: 0 })
    settleTimer.current = window.setTimeout(() => {
      settleTimer.current = null
      setSettling(false)
    }, 220)
  }, [clearSettle])

  const handlePointerEnter = useCallback((event: React.PointerEvent<HTMLAnchorElement>) => {
    clearSettle()
    setSettling(false)
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Ref so the first pointermove in this frame can shift (state alone races).
    shiftableRef.current = fine && !reduced
    if (shiftableRef.current) applyShift(event.clientX, event.clientY)
  }, [applyShift, clearSettle])

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLAnchorElement>) => {
    applyShift(event.clientX, event.clientY)
  }, [applyShift])

  const frameClass = [
    styles.frame,
    compact ? styles.frameCompact : '',
    settling ? styles.frameSettling : '',
  ].filter(Boolean).join(' ')
  const frameStyle = { '--shift-x': `${shift.x}px`, '--shift-y': `${shift.y}px` } as React.CSSProperties
  const iconSize = compact ? 18 : 20
  const frameChildren = (
    <>
      <span ref={viewportRef} className={styles.viewport}>
        <Image
          className={styles.image}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={image.sizes}
        />
      </span>
      <span className={styles.action} aria-hidden='true'>
        <span className={styles.actionIdle}><ArrowRightIcon size={iconSize} /></span>
        <span className={styles.actionLive}><ArrowRightIcon size={iconSize} /></span>
      </span>
    </>
  )

  return (
    <figure className={`${styles.figure} ${className ?? ''}`.trim()}>
      {trackEvent ? (
        <TrackedLink
          href={href}
          className={frameClass}
          aria-label={ariaLabel}
          event={trackEvent}
          onClick={onClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={resetShift}
          onPointerMove={handlePointerMove}
          style={frameStyle}
        >
          {frameChildren}
        </TrackedLink>
      ) : (
        <Link
          href={href}
          className={frameClass}
          aria-label={ariaLabel}
          onClick={onClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={resetShift}
          onPointerMove={handlePointerMove}
          style={frameStyle}
        >
          {frameChildren}
        </Link>
      )}
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  )
}
