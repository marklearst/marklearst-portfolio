'use client'

import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, type ReactNode } from 'react'
import { ArrowRightIcon } from '@/components/ui/Icon'
import { useAnimatedSelection } from '@/hooks/useAnimatedSelection'
import type { attachWorkSwipe } from './work-swipe'
import type { attachWorkSelectionSurface } from './work-selection-surface'
import styles from './FeaturedWork.module.css'

interface WorkItem {
  id: string
  label: string
  discipline: string
  title: ReactNode
  panel: ReactNode
}

// Next unmounts the homepage on navigation. Keep the chosen preview for the
// return journey; a full reload still starts with the first project.
let lastSelectedProject: string | undefined

function rememberProject(project: string) {
  lastSelectedProject = project
}

export default function WorkBrowser({ items }: { items: readonly WorkItem[] }) {
  const id = useId()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const surface = useRef<HTMLSpanElement>(null)
  const selectionSurface = useRef<ReturnType<typeof attachWorkSelectionSurface> | null>(null)
  const hoverPoint = useRef<{ x: number; y: number } | null>(null)
  const swipe = useRef<ReturnType<typeof attachWorkSwipe> | null>(null)
  const { value, motion, select } = useAnimatedSelection(
    items.find(item => item.id === lastSelectedProject)?.id ?? items[0].id,
  )

  function selectProject(project: string, pointer: boolean) {
    swipe.current?.cancel()
    rememberProject(project)
    select(project, pointer)
  }

  const selectFromGesture = useEffectEvent((project: string) => {
    if (stage.current?.contains(document.activeElement)) {
      tabs.current[items.findIndex(item => item.id === project)]?.focus({ preventScroll: true })
    }
    rememberProject(project)
    select(project, false)
  })

  useEffect(() => {
    const browser = root.current
    const panels = stage.current
    const tabList = list.current
    const highlight = surface.current
    if (!browser || !panels || !tabList || !highlight) return
    let disposed = false
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      // The real tabs and links already work. Load drag and highlight only near the work.
      void Promise.all([import('./work-swipe'), import('./work-selection-surface')]).then(([gesture, selection]) => {
        if (disposed) return
        swipe.current = gesture.attachWorkSwipe(panels, project => selectFromGesture(project))
        selectionSurface.current = selection.attachWorkSelectionSurface(tabList, highlight)
        const active = tabList.querySelector<HTMLElement>('[aria-selected="true"]')
        if (active) selectionSurface.current.moveTo(active, false)
      }).catch(() => { /* Keep the native buttons when a gesture chunk is unavailable. */ })
    }, { rootMargin: '160px' })
    observer.observe(browser)
    return () => {
      disposed = true
      observer.disconnect()
      swipe.current?.destroy()
      swipe.current = null
      selectionSurface.current?.destroy()
      selectionSurface.current = null
    }
  }, [])

  useLayoutEffect(() => {
    const tab = tabs.current[items.findIndex(item => item.id === value)]
    if (tab) selectionSurface.current?.moveTo(tab, motion)
  }, [items, value, motion])

  return (
    <div ref={root} className={styles.browser} data-motion={motion}>
      <div ref={list} className={styles.projectList} role='tablist' aria-label='Selected projects' aria-orientation='vertical'>
        <span className={styles.selectionClip} aria-hidden='true'>
          <span ref={surface} className={styles.selectionSurface} />
        </span>
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={element => { tabs.current[index] = element }}
            type='button'
            role='tab'
            id={`${id}-tab-${item.id}`}
            aria-label={item.label}
            aria-selected={value === item.id}
            aria-controls={`${id}-panel-${item.id}`}
            tabIndex={value === item.id ? 0 : -1}
            className={styles.projectChoice}
            onPointerEnter={event => {
              hoverPoint.current = { x: event.clientX, y: event.clientY }
            }}
            onPointerMove={event => {
              const previous = hoverPoint.current
              hoverPoint.current = { x: event.clientX, y: event.clientY }
              if (event.pointerType !== 'mouse' || root.current?.contains(document.activeElement)) return
              // A tab moving under a stationary pointer during scroll is not hover intent.
              if (!previous || (previous.x === event.clientX && previous.y === event.clientY)) return
              selectProject(item.id, true)
            }}
            onClick={event => {
              event.currentTarget.focus({ preventScroll: true })
              selectProject(item.id, event.detail > 0)
            }}
            onKeyDown={event => {
              let next = index
              if (event.key === 'ArrowDown') next = (index + 1) % items.length
              else if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length
              else if (event.key === 'Home') next = 0
              else if (event.key === 'End') next = items.length - 1
              else return
              event.preventDefault()
              selectProject(items[next].id, false)
              tabs.current[next]?.focus()
            }}
          >
            <span className={styles.choiceText}>
              <span className={styles.projectTitle}>{item.title}</span>
              <span className={styles.projectDiscipline}>{item.discipline}</span>
            </span>
            <span className={styles.choiceArrow} aria-hidden='true'><ArrowRightIcon size={24} /></span>
          </button>
        ))}
      </div>
      <div ref={stage} className={styles.panels}>
        {items.map(item => (
          <div
            key={item.id}
            id={`${id}-panel-${item.id}`}
            role='tabpanel'
            aria-labelledby={`${id}-tab-${item.id}`}
            className={styles.panel}
            data-work-project={item.id}
            data-active={value === item.id}
            inert={value !== item.id}
            aria-hidden={value !== item.id}
          >
            {item.panel}
          </div>
        ))}
      </div>
    </div>
  )
}
