'use client'

import { useCallback, useEffect, useRef } from 'react'

interface ImageOrigin {
  left: number
  top: number
  width: number
  height: number
  aspectRatio: number
}

/** Object-fit leaves empty space inside the image element. Measure its pixels. */
function containedImageBounds(image: HTMLImageElement | null): ImageOrigin | null {
  if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return null
  const style = getComputedStyle(image)
  if (style.objectFit !== 'contain' || style.objectPosition !== '50% 50%') return null

  const frame = image.getBoundingClientRect()
  if (!frame.width || !frame.height) return null
  const aspectRatio = image.naturalWidth / image.naturalHeight
  const width = Math.min(frame.width, frame.height * aspectRatio)
  const height = width / aspectRatio
  return {
    left: frame.left + (frame.width - width) / 2,
    top: frame.top + (frame.height - height) / 2,
    width,
    height,
    aspectRatio,
  }
}

export function useEvidenceOrigin() {
  const activeReveal = useRef<{ animation: Animation; dialog: HTMLDialogElement } | null>(null)

  const cancelOrigin = useCallback(() => {
    activeReveal.current?.animation.cancel()
    activeReveal.current?.dialog.removeAttribute('data-origin-motion')
    activeReveal.current = null
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handlePreference = () => { if (preference.matches) cancelOrigin() }
    preference.addEventListener('change', handlePreference)
    window.addEventListener('resize', cancelOrigin)
    return () => {
      preference.removeEventListener('change', handlePreference)
      window.removeEventListener('resize', cancelOrigin)
      cancelOrigin()
    }
  }, [cancelOrigin])

  function captureOrigin(image: HTMLImageElement | null, pointer: boolean) {
    cancelOrigin()
    if (!pointer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
    const origin = containedImageBounds(image)
    if (!origin || !image) return null

    // A clipped or covered thumbnail has no trustworthy on-screen origin.
    const right = origin.left + origin.width
    const bottom = origin.top + origin.height
    if (origin.left < 0 || origin.top < 0 || right > window.innerWidth || bottom > window.innerHeight) return null
    const trigger = image.closest('button')
    const corners = [[origin.left + 1, origin.top + 1], [right - 1, origin.top + 1], [origin.left + 1, bottom - 1], [right - 1, bottom - 1]]
    if (!trigger || corners.some(([x, y]) => !trigger.contains(document.elementFromPoint(x, y)))) return null
    return origin
  }

  function revealOrigin(origin: ImageOrigin | null, image: HTMLImageElement | null, dialog: HTMLDialogElement | null) {
    cancelOrigin()
    if (!origin || !image || !dialog?.open || !image.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const destination = containedImageBounds(image)
    if (!destination || Math.abs(origin.aspectRatio / destination.aspectRatio - 1) > 0.01) return

    const frame = image.getBoundingClientRect()
    const scale = origin.width / destination.width
    const x = origin.left - destination.left
    const y = origin.top - destination.top
    const transformOrigin = `${destination.left - frame.left}px ${destination.top - frame.top}px`
    const reveal = image.animate([
      { transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin },
      { transform: 'translate(0, 0) scale(1)', transformOrigin },
    ], { duration: 220, easing: 'cubic-bezier(.22, 1, .36, 1)' })

    activeReveal.current = { animation: reveal, dialog }
    dialog.setAttribute('data-origin-motion', '')
    void reveal.finished.then(() => {
      if (activeReveal.current?.animation === reveal) cancelOrigin()
    }, () => {})
  }

  return { captureOrigin, revealOrigin, cancelOrigin }
}
