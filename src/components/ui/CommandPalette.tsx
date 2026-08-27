'use client'

import { Command } from 'cmdk'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PROJECTS } from '@/data/projects'
import { useTransitionStore } from '@/store/transition-store'
import { MONOKAI } from '@/lib/monokai-colors'
import { OPEN_PORTFOLIO_TERMINAL } from './PortfolioTerminalButton'
import styles from './CommandPalette.module.css'

type CommandItem = {
  id: string
  label: string
  href: string
  group: string
}

const baseItems: CommandItem[] = [
  { id: 'about', label: 'About', href: '/about', group: 'Navigation' },
  { id: 'work', label: 'Work', href: '/work', group: 'Navigation' },
  { id: 'artifacts', label: 'Artifacts', href: '/artifacts', group: 'Navigation' },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const invokerRef = useRef<HTMLElement | null>(null)
  const labelId = useId()
  const descriptionId = useId()
  const router = useRouter()
  const startTransition = useTransitionStore((state) => state.startTransition)

  const items = useMemo<CommandItem[]>(() => {
    const workItems = PROJECTS.map((project) => ({
      id: `work-${project.slug}`,
      label: project.cardTitle,
      href: project.route,
      group: 'Case Studies',
    }))

    return [...baseItems, ...workItems]
  }, [])

  const closePalette = useCallback(() => {
    dialogRef.current?.close()
    setOpen(false)
    const invoker = invokerRef.current
    invokerRef.current = null
    if (invoker?.isConnected) invoker.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onOpen = (event: Event) => {
      const invoker = (event as CustomEvent<{ invoker?: HTMLElement }>).detail?.invoker
      invokerRef.current = invoker instanceof HTMLElement ? invoker : null
      setOpen(true)
    }
    window.addEventListener(OPEN_PORTFOLIO_TERMINAL, onOpen)
    return () => window.removeEventListener(OPEN_PORTFOLIO_TERMINAL, onOpen)
  }, [])

  useEffect(() => {
    if (open && !dialogRef.current?.open) {
      dialogRef.current?.showModal()
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [open])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !event.isComposing && !event.repeat) {
        event.preventDefault()
        if (dialogRef.current?.open) {
          closePalette()
        } else {
          invokerRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null
          setOpen(true)
        }
      }
    }

    // Reserve the global toggle before cmdk's optional Ctrl+K navigation binding.
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [closePalette])

  const handleSelect = (href: string) => {
    // Restore the invoking control before routing so a closing palette cannot
    // steal focus back after the destination page has received focus.
    closePalette()

    const url = new URL(href, window.location.origin)
    const targetPath = url.pathname === '' ? '/' : url.pathname

    startTransition(
      targetPath,
      () => {
        router.push(href)
      },
      href,
    )
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault()
        closePalette()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closePalette()
        }
      }}
    >
      {open && <Command
        label='Search portfolio pages'
        className={styles.panel}
        style={{ color: MONOKAI.foreground }}
      >
        <div className={styles.titlebar}>
          <h2 id={labelId}>~/portfolio</h2>
          <button type='button' onClick={closePalette} aria-label='Close portfolio terminal'>Esc <span aria-hidden='true'>×</span></button>
        </div>
        <div className={styles.inputRow}>
          <span aria-hidden='true'>❯</span>
          <Command.Input
            ref={inputRef}
            placeholder='Find a project or page…'
            className={styles.input}
            autoFocus
          />
        </div>
        <Command.List className={styles.list}>
          <Command.Empty className={styles.empty}>
            No matches. Try a project name.
          </Command.Empty>
          {['Navigation', 'Case Studies'].map((group) => (
            <Command.Group
              key={group}
              heading={group}
              className={styles.group}
            >
              {items
                .filter((item) => item.group === group)
                .map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.label} ${item.href}`}
                    onSelect={() => handleSelect(item.href)}
                    className={styles.item}
                  >
                    <span>{item.label}</span>
                    <span className={styles.path}>
                      {item.href}
                    </span>
                  </Command.Item>
                ))}
            </Command.Group>
          ))}
        </Command.List>
        <div id={descriptionId} className={styles.help}>
          <span>↑ ↓ to choose · Enter to open</span><span>Ctrl / ⌘ K</span>
        </div>
      </Command>}
    </dialog>
  )
}
