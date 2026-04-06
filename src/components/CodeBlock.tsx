'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { usePathname } from 'next/navigation'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { MONOKAI } from '@/lib/monokai-colors'
import { useAnalytics } from '@/hooks/useAnalytics'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  analyticsLabel?: string
}

// Custom Monokai Pro theme matching our brand colors
const monokaiProTheme: Record<string, CSSProperties> = {
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
    fontSize: '14px',
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
    fontSize: '14px',
    tabSize: 4,
    hyphens: 'none',
    padding: '0',
    margin: '0',
    overflow: 'auto',
  },
  comment: {
    color: '#727072',
    fontStyle: 'italic',
  },
  prolog: {
    color: '#727072',
  },
  doctype: {
    color: '#727072',
  },
  cdata: {
    color: '#727072',
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
    <div ref={blockRef} className='relative group mt-4 mb-6'>
      {/* Hover glow effect */}
      <div className='absolute -inset-1 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-700' />

      {/* Code container */}
      <div className='relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden'>
        {/* macOS window dots */}
        <div className='absolute top-4 left-4 flex gap-2 z-10'>
          <div className='w-3 h-3 rounded-full bg-red-500/30' />
          <div className='w-3 h-3 rounded-full bg-yellow-500/30' />
          <div className='w-3 h-3 rounded-full bg-green-500/30' />
        </div>

        {/* Code block */}
        <div className='p-6 pt-12 overflow-x-auto'>
          <SyntaxHighlighter
            language={language}
            style={monokaiProTheme}
            showLineNumbers={showLineNumbers}
            customStyle={{
              background: 'transparent',
              padding: 0,
              margin: 0,
              fontSize: '14px',
            }}
            codeTagProps={{
              style: {
                fontFamily: '"MonoLisa", "SF Mono", Consolas, monospace',
                fontFeatureSettings: '"liga" 1, "calt" 1',
                backgroundColor: 'transparent',
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}
