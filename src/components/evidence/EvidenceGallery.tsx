'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type Ref } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CloseIcon, MaximizeIcon } from '@/components/ui/Icon'
import { stageSizes, viewerSizes, type EvidenceImage } from './evidence-image-preparation'
import { useEvidenceGallery, type EvidenceRequest } from './useEvidenceGallery'
import { useEvidenceOrigin } from './useEvidenceOrigin'
import styles from './EvidenceGallery.module.css'

export type { EvidenceImage } from './evidence-image-preparation'

interface EvidenceImagesProps {
  current: EvidenceImage
  previous?: EvidenceImage
  sizes: string
  imageRef?: Ref<HTMLImageElement>
  loading?: 'eager' | 'lazy'
  onAnimationEnd: () => void
}

function EvidenceImages({ current, previous, sizes, imageRef, loading, onAnimationEnd }: EvidenceImagesProps) {
  return <>
    {previous && (
      <Image key={`previous-${previous.src}`} src={previous.src} width={previous.width} height={previous.height} alt='' aria-hidden='true' sizes={sizes} className={styles.outgoing} />
    )}
    <Image ref={imageRef} key={current.src} src={current.src} width={current.width} height={current.height} alt={current.alt} sizes={sizes} loading={loading} className={previous ? styles.incoming : undefined} onAnimationEnd={onAnimationEnd} />
  </>
}

interface GalleryFeedbackProps {
  request: EvidenceRequest | null
  message: string
  active: boolean
  retryRef: Ref<HTMLButtonElement>
  onRetry: (index: number, pointer: boolean, button: HTMLButtonElement) => void
}

function GalleryFeedback({ request, message, active, retryRef, onRetry }: GalleryFeedbackProps) {
  const canRetry = request?.status === 'error'
  const showRetry = canRetry || request?.status === 'retrying'

  function handleRetry(event: MouseEvent<HTMLButtonElement>) {
    if (canRetry && request) onRetry(request.index, event.detail > 0, event.currentTarget)
  }

  return (
    <div className={request ? styles.feedback : styles.screenReaderOnly}>
      <span role='status' aria-live={active ? 'polite' : 'off'} aria-atomic='true'>{message}</span>
      {showRetry && <button ref={retryRef} type='button' aria-disabled={!canRetry} onClick={handleRetry}>Retry</button>}
    </div>
  )
}

export default function EvidenceGallery({ items, label = 'Project evidence' }: { items: EvidenceImage[]; label?: string }) {
  const { selection, request, feedback, select, step, stopAnimation, finishAnimation } = useEvidenceGallery(items)
  const [isOpen, setIsOpen] = useState(false)
  const [preparedSource, setPreparedSource] = useState<string | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const thumbnail = useRef<HTMLImageElement>(null)
  const enlargedImage = useRef<HTMLImageElement>(null)
  const { captureOrigin, revealOrigin, cancelOrigin } = useEvidenceOrigin()
  const opener = useRef<HTMLButtonElement>(null)
  const choices = useRef<HTMLDivElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const inlineRetry = useRef<HTMLButtonElement>(null)
  const dialogRetry = useRef<HTMLButtonElement>(null)
  const current = items[selection.index]
  const previous = selection.previous === null ? undefined : items[selection.previous]

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    const restoreFocus = () => {
      cancelOrigin()
      setIsOpen(false)
      stopAnimation()
      opener.current?.focus({ preventScroll: true })
    }
    element.addEventListener('close', restoreFocus)
    return () => element.removeEventListener('close', restoreFocus)
  }, [cancelOrigin, stopAnimation])

  if (!current) return null

  function focusSelectionControl(index: number) {
    const target = dialog.current?.open
      ? nextButton.current
      : choices.current?.querySelectorAll('button').item(index)
    target?.focus({ preventScroll: true })
  }

  function selectionOptions(pointer: boolean, retryButton?: HTMLButtonElement) {
    return {
      pointer,
      retrying: Boolean(retryButton),
      beforeSelect(index: number, isCommitted: boolean) {
        cancelOrigin()
        const active = document.activeElement
        if ((!retryButton || isCommitted) && active && (active === inlineRetry.current || active === dialogRetry.current)) {
          focusSelectionControl(index)
        }
      },
      onCommit(index: number) {
        cancelOrigin()
        if (retryButton === document.activeElement) focusSelectionControl(index)
      },
    }
  }

  function selectImage(index: number, pointer = false, retryButton?: HTMLButtonElement) {
    void select(index, selectionOptions(pointer, retryButton))
  }

  function stepImage(direction: number, pointer = false) {
    void step(direction, selectionOptions(pointer))
  }

  function openDialog(event: MouseEvent<HTMLButtonElement>) {
    const origin = captureOrigin(thumbnail.current, event.detail > 0)
    stopAnimation()
    dialog.current?.showModal()
    revealOrigin(origin, enlargedImage.current, dialog.current)
    setIsOpen(true)
  }

  function prepareViewer() {
    // Only the current evidence is prepared, after intent to inspect it.
    setPreparedSource(current.src)
  }

  function closeDialog() {
    cancelOrigin()
    dialog.current?.close()
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeDialog()
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (items.length < 2 || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')) return
    event.preventDefault()
    stepImage(event.key === 'ArrowRight' ? 1 : -1)
  }

  return (
    <figure className={styles.gallery} aria-label={label}>
      {items.length > 1 && (
        <div ref={choices} className={styles.choices} role='group' aria-label='Choose a view'>
          {items.map((item, index) => {
            const pending = request?.index === index && request.status !== 'error'
            return (
              <button key={item.src} type='button' aria-pressed={selection.index === index} aria-busy={pending} data-pending={pending || undefined} onClick={event => selectImage(index, event.detail > 0)}>{item.title}</button>
            )
          })}
        </div>
      )}
      <div className={styles.stageFrame}>
        <button ref={opener} type='button' className={styles.stage} aria-label={`Enlarge ${current.title}`} aria-haspopup='dialog' onPointerEnter={prepareViewer} onFocus={prepareViewer} onClick={openDialog}>
          <EvidenceImages imageRef={thumbnail} current={current} previous={isOpen ? undefined : previous} sizes={stageSizes} onAnimationEnd={() => finishAnimation(selection.version)} />
          <span className={styles.enlarge}><MaximizeIcon /> Inspect image</span>
        </button>
        {items.length > 1 && <GalleryFeedback request={request} message={feedback} active={!isOpen} retryRef={inlineRetry} onRetry={selectImage} />}
      </div>
      <figcaption className={styles.caption}>
        <span>{current.caption}</span>
        {current.sourceUrl && <a href={current.sourceUrl} target='_blank' rel='noopener noreferrer'>View original <ArrowUpRightIcon /></a>}
      </figcaption>
      <dialog ref={dialog} className={styles.dialog} aria-label={`${label}, enlarged view`} onClick={handleBackdropClick} onKeyDown={handleDialogKeyDown}>
        <div className={styles.viewer}>
          <div className={styles.viewerHeader}>
            <h2>{current.title}</h2>
            <button type='button' aria-label='Close image' onClick={closeDialog}><CloseIcon size={20} /></button>
          </div>
          <div className={styles.viewerMedia}>
            <EvidenceImages imageRef={enlargedImage} loading={preparedSource === current.src ? 'eager' : 'lazy'} current={current} previous={isOpen ? previous : undefined} sizes={viewerSizes} onAnimationEnd={() => finishAnimation(selection.version)} />
            {items.length > 1 && <GalleryFeedback request={request} message={feedback} active={isOpen} retryRef={dialogRetry} onRetry={selectImage} />}
          </div>
          <div className={styles.viewerFooter}>
            <div className={styles.viewerContext}>
              <p>{current.caption}</p>
              {current.sourceUrl && <a href={current.sourceUrl} target='_blank' rel='noopener noreferrer'>View original <ArrowUpRightIcon /></a>}
            </div>
            {items.length > 1 && <div className={styles.controls}>
              <button type='button' aria-label='Previous image' onClick={event => stepImage(-1, event.detail > 0)}><ArrowLeftIcon /></button>
              <span>{selection.index + 1} / {items.length}</span>
              <button ref={nextButton} type='button' aria-label='Next image' onClick={event => stepImage(1, event.detail > 0)}><ArrowRightIcon /></button>
            </div>}
          </div>
        </div>
      </dialog>
    </figure>
  )
}
