'use client'

import { getImageProps } from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createEvidenceImagePreparation, type EvidenceImage } from './evidence-image-preparation'

export interface EvidenceRequest {
  index: number
  status: 'loading' | 'error' | 'retrying'
}

interface SelectionOptions {
  pointer?: boolean
  retrying?: boolean
  beforeSelect?: (index: number, isCommitted: boolean) => void
  onCommit?: (index: number) => void
}

async function decodeImage(item: EvidenceImage, sizes: string) {
  const { props } = getImageProps({ src: item.src, width: item.width, height: item.height, alt: item.alt, sizes })
  const image = new window.Image()
  image.sizes = props.sizes ?? ''
  image.srcset = props.srcSet ?? ''
  image.src = props.src
  await image.decode()
}

export function useEvidenceGallery(items: EvidenceImage[]) {
  const [selection, setSelection] = useState({ index: 0, previous: null as number | null, version: 0 })
  const [request, setRequest] = useState<EvidenceRequest | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const committed = useRef(0)
  const requested = useRef(0)
  const requestVersion = useRef(0)
  const animationVersion = useRef(0)
  const animating = useRef(false)
  const preparation = useRef<ReturnType<typeof createEvidenceImagePreparation> | null>(null)
  if (preparation.current === null) {
    preparation.current = createEvidenceImagePreparation({
      decode: decodeImage,
      readEnvironment: () => ({ width: window.innerWidth, pixelRatio: window.devicePixelRatio }),
    })
  }

  const stopAnimation = useCallback(() => {
    animating.current = false
    setSelection(value => value.previous === null ? value : { ...value, previous: null })
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const stopMotion = () => {
      if (preference.matches) stopAnimation()
    }
    preference.addEventListener('change', stopMotion)
    return () => {
      preference.removeEventListener('change', stopMotion)
      // Invalidate in-flight work without permanently disabling the preparer
      // during Strict Mode's effect cleanup rehearsal.
      requestVersion.current += 1
    }
  }, [stopAnimation])

  async function select(index: number, options: SelectionOptions = {}) {
    const item = items[index]
    if (!item) return
    const isCommitted = index === committed.current
    options.beforeSelect?.(index, isCommitted)
    const version = ++requestVersion.current
    const isCurrent = () => version === requestVersion.current
    const mayAnimate = options.pointer && !animating.current
    requested.current = index

    if (isCommitted) {
      setRequest(null)
      stopAnimation()
      return
    }

    let ready: boolean
    try {
      ready = await preparation.current!(item, {
        isCurrent,
        onPending: () => setRequest({ index, status: options.retrying ? 'retrying' : 'loading' }),
      })
    } catch {
      if (isCurrent()) setRequest({ index, status: 'error' })
      return
    }
    if (!ready || !isCurrent()) return

    const animate = Boolean(mayAnimate) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const previous = animate ? committed.current : null
    committed.current = index
    animating.current = animate
    animationVersion.current = version
    setSelection({ index, previous, version })
    // The view can transfer focus before clearing the retry control.
    options.onCommit?.(index)
    setRequest(null)
    setAnnouncement(`${item.title}. Image ${index + 1} of ${items.length}.`)
  }

  function step(direction: number, options?: SelectionOptions) {
    return select((requested.current + direction + items.length) % items.length, options)
  }

  function finishAnimation(version: number) {
    if (version !== animationVersion.current) return
    animating.current = false
    setSelection(value => value.version === version ? { ...value, previous: null } : value)
  }

  const feedback = request
    ? `${request.status === 'error' ? 'Couldn’t load' : 'Loading'} ${items[request.index].title}${request.status === 'error' ? '.' : '…'}`
    : announcement

  return { selection, request, feedback, select, step, stopAnimation, finishAnimation }
}
