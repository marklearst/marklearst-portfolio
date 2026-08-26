'use client'

import { Command } from 'cmdk'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PROJECTS } from '@/data/projects'
import { useTransitionStore } from '@/store/transition-store'
import { MONOKAI } from '@/lib/monokai-colors'

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
      className='fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-4 open:flex open:items-start open:justify-center backdrop:bg-black/70 backdrop:backdrop-blur-sm'
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
        className='mt-20 flex max-h-[calc(100dvh-8rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1d1a1c]/95 shadow-2xl'
        style={{ color: MONOKAI.foreground }}
      >
        <h2 id={labelId} className='sr-only'>Navigate the portfolio</h2>
        <div className='border-b border-white/10 px-4 py-3'>
          <Command.Input
            ref={inputRef}
            placeholder='Jump to...'
            className='min-h-8 w-full bg-transparent font-mono text-base outline-none placeholder:text-white/40'
            autoFocus
          />
        </div>
        <Command.List className='min-h-0 max-h-[420px] overflow-y-auto overscroll-contain px-2 py-2'>
          <Command.Empty className='px-3 py-6 text-center text-sm text-white/50 font-mono'>
            No results.
          </Command.Empty>
          {['Navigation', 'Case Studies'].map((group) => (
            <Command.Group
              key={group}
              heading={group}
              className='px-2 py-2 text-xs font-mono uppercase tracking-wider text-white/40'
            >
              {items
                .filter((item) => item.group === group)
                .map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.label} ${item.href}`}
                    onSelect={() => handleSelect(item.href)}
                    className='flex min-h-11 items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm font-mono text-white/70 data-[selected=true]:bg-white/10 data-[selected=true]:text-white'
                  >
                    <span>{item.label}</span>
                    <span className='text-[10px] uppercase tracking-wider text-white/40'>
                      {item.href}
                    </span>
                  </Command.Item>
                ))}
            </Command.Group>
          ))}
        </Command.List>
        <div id={descriptionId} className='shrink-0 border-t border-white/10 px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-white/40'>
          Press Esc to close
        </div>
      </Command>}
    </dialog>
  )
}
