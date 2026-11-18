'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from '@/components/ui/Icon'
import styles from './ChapterNav.module.css'

interface ChapterNavProps {
  label: string
  chapters: { id: string; label: string }[]
}

export default function ChapterNav({ label, chapters }: ChapterNavProps) {
  const anchor = useRef<HTMLDivElement>(null)
  const details = useRef<HTMLDetailsElement>(null)
  const trigger = useRef<HTMLElement>(null)
  const [current, setCurrent] = useState(0)
  const [floating, setFloating] = useState(false)

  useEffect(() => {
    const slot = anchor.current
    if (!slot) return
    const sections = chapters.map(({ id }) => document.getElementById(id))
    const end = slot.parentElement?.querySelector('[data-reading-end]')
    const touch = matchMedia('(pointer: coarse) and (min-height: 420px)')
    const header = document.querySelector('header')
    let landingOffsets: number[] = []
    const measureInsets = () => {
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
      landingOffsets = sections.map(section => padding + (section ? parseFloat(getComputedStyle(section).scrollMarginTop) || 0 : 0))
    }
    let frame = 0
    const measure = () => {
      frame = 0
      const top = header?.getBoundingClientRect().bottom ?? 0
      const line = Math.max(0, top) + innerHeight * .18
      let index = 0
      for (let i = 1; i < sections.length; i++) {
        // Native fragment landing includes both the scrollport padding and the section margin.
        if ((sections[i]?.getBoundingClientRect().top ?? Infinity) > Math.max(line, landingOffsets[i] + 1)) break
        index = i
      }
      setCurrent(index)
      const belowContents = slot.getBoundingClientRect().bottom <= Math.max(0, top)
      const reading = !end || end.getBoundingClientRect().top > innerHeight * .8
      setFloating(touch.matches && belowContents && reading)
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(measure) }
    // Resize also catches late-loading images or a demonstration that expands within a chapter.
    const resize = new ResizeObserver(() => { measureInsets(); queue() })
    if (slot.parentElement) resize.observe(slot.parentElement)
    measureInsets()
    queue()
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue)
    touch.addEventListener('change', queue)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
      touch.removeEventListener('change', queue)
    }
  }, [chapters])

  useEffect(() => {
    const menu = details.current
    if (!menu) return
    const outside = (event: PointerEvent) => {
      if (menu.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false
    }
    const escape = (event: KeyboardEvent) => {
      if (menu.open && event.key === 'Escape') {
        menu.open = false
        trigger.current?.focus({ preventScroll: true })
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [])

  return (
    <div className={styles.slot} ref={anchor}>
      <details ref={details} className={styles.menu} data-floating={floating || undefined}>
        <summary ref={trigger} onClick={event => {
          if (details.current) details.current.dataset.input = event.detail > 0 ? 'pointer' : 'keyboard'
        }} aria-label={floating ? `Chapters, ${chapters[current]?.label}, ${current + 1} of ${chapters.length}` : undefined}>
          <span className={styles.ticks} aria-hidden='true'>
            {chapters.map((chapter, i) => <i key={chapter.id} data-read={i <= current || undefined} />)}
          </span>
          <span className={styles.context}>{label}</span>
          <span className={styles.current}>{chapters[current]?.label}</span>
          <span className={styles.count}>{current + 1} / {chapters.length}</span>
          <ChevronDownIcon size={16} />
        </summary>
        <nav aria-label={label}>
          <ol>{chapters.map(({ id, label: name }, index) => (
            <li key={id}><a href={`#${id}`} aria-current={current === index ? 'location' : undefined}
              onClick={() => {
                if (details.current) details.current.open = false
                const target = document.getElementById(id)
                if (target) {
                  target.tabIndex = -1
                  target.focus({ preventScroll: true })
                }
              }}>{name}</a></li>
          ))}</ol>
        </nav>
      </details>
    </div>
  )
}
