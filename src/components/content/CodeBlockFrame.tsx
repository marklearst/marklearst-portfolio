'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { CheckIcon, CopyIcon } from '@/components/ui/Icon'
import { trackCodeBlockView } from '@/lib/analytics'
import styles from './CodeBlock.module.css'

interface CodeBlockFrameProps {
  code: string
  language: string
  analyticsLabel?: string
  children: ReactNode
}

export default function CodeBlockFrame({ code, language, analyticsLabel, children }: CodeBlockFrameProps) {
  const pathname = usePathname()
  const blockRef = useRef<HTMLDivElement>(null)
  const hasTrackedRef = useRef(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const resetCopyRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (resetCopyRef.current) clearTimeout(resetCopyRef.current)
  }, [])

  const copyCode = async () => {
    if (resetCopyRef.current) clearTimeout(resetCopyRef.current)
    try {
      await navigator.clipboard.writeText(code)
      setCopyState('copied')
      resetCopyRef.current = setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('failed')
    }
  }


  useEffect(() => {
    if (!blockRef.current || hasTrackedRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || hasTrackedRef.current) return
          hasTrackedRef.current = true

          const project = pathname.startsWith('/work/')
            ? pathname.split('/').pop() || undefined
            : undefined

          trackCodeBlockView({
            route: pathname,
            project,
            label: analyticsLabel,
            language,
          })

          observer.disconnect()
        })
      },
      { threshold: 0.5 },
    )

    observer.observe(blockRef.current)

    return () => {
      observer.disconnect()
    }
  }, [analyticsLabel, language, pathname])


  return (
    <div ref={blockRef} className={styles.block}>
      <div className={styles.header}>
        <span>{language}</span>
        <button type='button' onClick={copyCode} aria-label='Copy code'>
          {copyState === 'copied' ? <CheckIcon /> : <CopyIcon />}
          <span>{copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy code'}</span>
        </button>
      </div>
      <span className={styles.status} role='status'>
        {copyState === 'copied' ? 'Code copied.' : copyState === 'failed' ? 'Copy unavailable. Select the code below.' : ''}
      </span>
      {children}
    </div>
  )
}
