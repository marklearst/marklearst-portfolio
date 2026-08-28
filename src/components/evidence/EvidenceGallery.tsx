'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CloseIcon, MaximizeIcon } from '@/components/ui/Icon'
import styles from './EvidenceGallery.module.css'

export interface EvidenceImage {
  src: string
  width: number
  height: number
  title: string
  alt: string
  caption: string
  sourceUrl?: string
}

export default function EvidenceGallery({ items, label = 'Project evidence' }: { items: EvidenceImage[]; label?: string }) {
  const [selected, setSelected] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const current = items[selected]

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    const restoreFocus = () => opener.current?.focus({ preventScroll: true })
    element.addEventListener('close', restoreFocus)
    return () => element.removeEventListener('close', restoreFocus)
  }, [])

  if (!current) return null
  const step = (direction: number) => setSelected(index => (index + direction + items.length) % items.length)

  return (
    <figure className={styles.gallery} aria-label={label}>
      {items.length > 1 && (
        <div className={styles.choices} role='group' aria-label='Choose a view'>
          {items.map((item, index) => (
            <button key={item.src} type='button' aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.title}</button>
          ))}
        </div>
      )}
      <button ref={opener} type='button' className={styles.stage} aria-label={`Enlarge ${current.title}`} aria-haspopup='dialog' onClick={() => dialog.current?.showModal()}>
        <Image src={current.src} width={current.width} height={current.height} alt={current.alt} sizes='(max-width: 768px) 100vw, 1024px' />
        <span className={styles.enlarge}><MaximizeIcon /> Inspect image</span>
      </button>
      <figcaption className={styles.caption}>
        <span>{current.caption}</span>
        {current.sourceUrl && <a href={current.sourceUrl} target='_blank' rel='noopener noreferrer'>View original <ArrowUpRightIcon /></a>}
      </figcaption>
      <dialog ref={dialog} className={styles.dialog} aria-label={`${label}, enlarged view`} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }} onKeyDown={event => {
        if (event.key === 'ArrowRight' && items.length > 1) { event.preventDefault(); step(1) }
        if (event.key === 'ArrowLeft' && items.length > 1) { event.preventDefault(); step(-1) }
      }}>
        <div className={styles.viewer}>
          <div className={styles.viewerHeader}>
            <h2>{current.title}</h2>
            <button type='button' aria-label='Close image' onClick={() => dialog.current?.close()}><CloseIcon size={20} /></button>
          </div>
          <Image src={current.src} width={current.width} height={current.height} alt={current.alt} sizes='100vw' />
          <div className={styles.viewerFooter}>
            <div className={styles.viewerContext}>
              <p>{current.caption}</p>
              {current.sourceUrl && <a href={current.sourceUrl} target='_blank' rel='noopener noreferrer'>View original <ArrowUpRightIcon /></a>}
            </div>
            {items.length > 1 && <div className={styles.controls}>
              <button type='button' aria-label='Previous image' onClick={() => step(-1)}><ArrowLeftIcon /></button>
              <span aria-live='polite'>{selected + 1} / {items.length}</span>
              <button type='button' aria-label='Next image' onClick={() => step(1)}><ArrowRightIcon /></button>
            </div>}
          </div>
        </div>
      </dialog>
    </figure>
  )
}
