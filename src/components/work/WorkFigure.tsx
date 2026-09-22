'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode, ComponentProps } from 'react'
import TrackedLink from '@/components/analytics/TrackedLink'
import { ArrowRightIcon } from '@/components/ui/Icon'
import styles from './WorkFigure.module.css'

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
  const frameClass = [styles.frame, compact ? styles.frameCompact : ''].filter(Boolean).join(' ')
  const iconSize = compact ? 18 : 20
  const frameChildren = (
    <>
      <span className={styles.viewport}>
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
        >
          {frameChildren}
        </TrackedLink>
      ) : (
        <Link
          href={href}
          className={frameClass}
          aria-label={ariaLabel}
          onClick={onClick}
        >
          {frameChildren}
        </Link>
      )}
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  )
}
