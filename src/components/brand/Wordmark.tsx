'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from 'react'
import { trackNavigationClick, trackLogoHover } from '@/lib/analytics'
import type { turnLetters } from '@/lib/letter-turn'
import styles from './Wordmark.module.css'

const LETTERS = Array.from('{marklearst}')
const INITIALS = '{ml}'
const onScroll = (notify: () => void) => {
  window.addEventListener('scroll', notify, { passive: true })
  return () => window.removeEventListener('scroll', notify)
}

export default function Wordmark() {
  const pathname = usePathname()
  const link = useRef<HTMLAnchorElement>(null)
  const folded = useSyncExternalStore(
    onScroll,
    () => window.scrollY > (link.current?.offsetHeight ?? 0),
    () => false,
  )

  useEffect(() => {
    const node = link.current
    if (!node) return
    const desktop = matchMedia('(min-width: 656px) and (hover: hover) and (pointer: fine)')
    const root = document.documentElement
    const front = Array.from(node.querySelectorAll<HTMLElement>('[data-face="front"]'))
    const back = Array.from(node.querySelectorAll<HTMLElement>('[data-face="back"]'))
    let wanted = false
    let flipped = false
    let busy = false
    let revision = 0
    let playback: ReturnType<typeof turnLetters> | undefined

    async function sync() {
      if (playback) {
        playback.aim(wanted)
        return
      }
      if (!node || busy || flipped === wanted) return
      const run = revision
      busy = true
      try {
        const { turnLetters } = await import('@/lib/letter-turn')
        while (run === revision && wanted && node.hasAttribute('data-folded')) {
          // Let the initials open into the full name before the letters turn.
          const unfolding = node.getAnimations({ subtree: true }).filter(a => a instanceof CSSTransition && a.transitionProperty === 'translate' && a.playState !== 'finished')
          if (!unfolding.length) break
          await Promise.allSettled(unfolding.map(a => a.finished))
        }
        if (run === revision && wanted !== flipped) {
          playback = flipped ? turnLetters(back, front, true) : turnLetters(front, back)
          await playback.finished
          if (run !== revision) return
          flipped = wanted
          node.toggleAttribute('data-flipped', flipped)
          playback.cancel()
          playback = undefined
        }
      } catch {
        if (run === revision) {
          wanted = flipped = false
          playback?.cancel()
          playback = undefined
          node.removeAttribute('data-flipped')
        }
      } finally {
        if (run === revision) {
          busy = false
          node.toggleAttribute('data-open', wanted)
        }
      }
    }

    const open = () => {
      if (!desktop.matches || document.hidden || root.hasAttribute('data-inspecting') || root.dataset.motion === 'reduced') return
      wanted = true
      node.setAttribute('data-open', '')
      void sync()
    }
    const enter = (event: PointerEvent) => { if (event.pointerType === 'mouse') open() }
    const leave = () => {
      wanted = false
      if (!playback && !flipped) node.removeAttribute('data-open')
      void sync()
    }
    const reset = () => {
      revision++
      playback?.cancel()
      playback = undefined
      wanted = flipped = busy = false
      node.removeAttribute('data-open')
      node.removeAttribute('data-flipped')
    }
    const refresh = () => {
      reset()
      if (node.matches(':hover')) open()
    }
    const settings = new MutationObserver(refresh)
    settings.observe(root, { attributes: true, attributeFilter: ['data-inspecting', 'data-motion'] })
    desktop.addEventListener('change', refresh)
    document.addEventListener('visibilitychange', refresh)
    node.addEventListener('pointerenter', enter)
    node.addEventListener('pointerleave', leave)
    return () => {
      reset()
      settings.disconnect()
      desktop.removeEventListener('change', refresh)
      document.removeEventListener('visibilitychange', refresh)
      node.removeEventListener('pointerenter', enter)
      node.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <Link ref={link} href='/' className={styles.link} aria-label='marklearst, home'
      data-folded={folded || undefined}
      onClick={() => {
        if (pathname !== '/') trackNavigationClick({ action: 'logo_click', from: pathname, to: '/' })
      }}
      onPointerEnter={event => {
        if (folded && event.pointerType === 'mouse') trackLogoHover({ action: 'expand' })
      }}>
      <span aria-hidden='true' className={styles.wordmark}>
        {LETTERS.map((letter, index) => {
          const brace = index === 0 || index === LETTERS.length - 1
          const compactIndex = INITIALS.indexOf(letter)
          const offset = compactIndex >= 0 ? compactIndex - index : 0
          return <span key={index} className={styles.cell} data-brace={brace || undefined}
            data-extra={compactIndex < 0 || undefined}
            style={offset ? { '--cell-offset': offset } as CSSProperties : undefined}>
            <span data-face='front'>{letter}</span><span data-face='back'>{letter}</span>
          </span>
        })}
      </span>
    </Link>
  )
}
