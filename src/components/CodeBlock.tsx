'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { usePathname } from 'next/navigation'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { CheckIcon, CopyIcon } from '@/components/ui/Icon'
import styles from './CodeBlock.module.css'
import { MONOKAI } from '@/lib/monokai-colors'
import { useAnalytics } from '@/hooks/useAnalytics'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  analyticsLabel?: string
}

// Restrained syntax colors follow the portfolio token source.
const codeTheme: Record<string, CSSProperties> = {
  'code[class*="language-"]': {
    color: MONOKAI.foreground,
    background: 'transparent',
    fontFamily: '"MonoLisa", "SF Mono", Consolas, monospace',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.6',
    fontSize: '16px',
    tabSize: 4,
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: MONOKAI.foreground,
    background: 'transparent',
    fontFamily: '"MonoLisa", "SF Mono", Consolas, monospace',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.6',
    fontSize: '16px',
    tabSize: 4,
    hyphens: 'none',
    padding: '0',
    margin: '0',
    overflow: 'auto',
  },
  comment: {
    color: MONOKAI.purple,
    fontStyle: 'italic',
  },
  prolog: {
    color: MONOKAI.purple,
  },
  doctype: {
    color: MONOKAI.purple,
  },
  cdata: {
    color: MONOKAI.purple,
  },
  punctuation: {
    color: `${MONOKAI.foreground}b3`,
  },
  '.namespace': {
    opacity: '.7',
  },
  property: {
    color: MONOKAI.cyan,
  },
  tag: {
    color: MONOKAI.pink,
  },
  constant: {
    color: MONOKAI.purple,
  },
  symbol: {
    color: MONOKAI.purple,
  },
  deleted: {
    color: MONOKAI.pink,
  },
  boolean: {
    color: MONOKAI.purple,
  },
  number: {
    color: MONOKAI.purple,
  },
  selector: {
    color: MONOKAI.green,
  },
  'attr-name': {
    color: MONOKAI.green,
  },
  string: {
    color: MONOKAI.yellow,
  },
  char: {
    color: MONOKAI.yellow,
  },
  builtin: {
    color: MONOKAI.cyan,
  },
  inserted: {
    color: MONOKAI.green,
  },
  operator: {
    color: MONOKAI.pink,
  },
  entity: {
    color: MONOKAI.yellow,
    cursor: 'help',
  },
  url: {
    color: MONOKAI.cyan,
  },
  '.language-css .token.string': {
    color: MONOKAI.green,
  },
  '.style .token.string': {
    color: MONOKAI.green,
  },
  variable: {
    color: MONOKAI.foreground,
  },
  atrule: {
    color: MONOKAI.yellow,
  },
  'attr-value': {
    color: MONOKAI.yellow,
  },
  function: {
    color: MONOKAI.green,
  },
  'class-name': {
    color: MONOKAI.cyan,
  },
  keyword: {
    color: MONOKAI.pink,
  },
  regex: {
    color: MONOKAI.orange,
  },
  important: {
    color: MONOKAI.orange,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
}

export default function CodeBlock({
  code,
  language = 'typescript',
  showLineNumbers = false,
  analyticsLabel,
}: CodeBlockProps) {
  const { trackCodeBlockView } = useAnalytics()
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
  }, [analyticsLabel, language, pathname, trackCodeBlockView])

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
      <div className={styles.source} tabIndex={0} role='region' aria-label={language + ' code'}>
          <SyntaxHighlighter
            language={language}
            style={codeTheme}
            showLineNumbers={showLineNumbers}
            customStyle={{
              background: 'transparent',
              padding: 0,
              margin: 0,
              fontSize: '16px',
              borderRadius: 0,
              overflow: 'visible',
            }}
            codeTagProps={{
              style: {
                fontFamily: '"MonoLisa", "SF Mono", Consolas, monospace',
                fontFeatureSettings: '"liga" 1, "calt" 1',
                backgroundColor: 'transparent',
                padding: 0,
                borderRadius: 0,
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
      </div>
    </div>
  )
}
