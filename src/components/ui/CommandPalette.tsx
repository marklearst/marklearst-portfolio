'use client'

import { Command } from 'cmdk'
import { useEffect, useMemo, useState } from 'react'
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
  const router = useRouter()
  const { startTransition, isTransitioning } = useTransitionStore()

  const items = useMemo<CommandItem[]>(() => {
    const workItems = PROJECTS.map((project) => ({
      id: `work-${project.slug}`,
      label: project.cardTitle,
      href: project.route,
      group: 'Case Studies',
    }))

    return [...baseItems, ...workItems]
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSelect = (href: string) => {
    setOpen(false)

    if (isTransitioning) return

    const url = new URL(href, window.location.origin)
    const targetPath = url.pathname === '' ? '/' : url.pathname
    const hash = url.hash.replace('#', '')

    startTransition(
      targetPath,
      () => {
        router.push(href)
        setTimeout(() => {
          if (hash) {
            const element = document.getElementById(hash)
            if (element) {
              element.scrollIntoView({ behavior: 'instant' })
              return
            }
          }
          window.scrollTo({ top: 0, behavior: 'instant' })
        }, 100)
      },
      href,
    )
  }

  if (!open) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm'
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setOpen(false)
        }
      }}
    >
      <Command
        className='mt-24 w-full max-w-xl rounded-2xl border border-white/10 bg-[#1d1a1c]/95 shadow-2xl'
        style={{ color: MONOKAI.foreground }}
      >
        <div className='border-b border-white/10 px-4 py-3'>
          <Command.Input
            placeholder='Jump to...'
            className='w-full bg-transparent font-mono text-sm outline-none placeholder:text-white/40'
            autoFocus
          />
        </div>
        <Command.List className='max-h-[420px] overflow-y-auto px-2 py-2'>
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
                    className='flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm font-mono text-white/70 data-[selected=true]:bg-white/10 data-[selected=true]:text-white'
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
        <div className='border-t border-white/10 px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-white/40'>
          Press Esc to close
        </div>
      </Command>
    </div>
  )
}
