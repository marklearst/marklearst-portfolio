'use client'

import { useEffect, useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'

const STORAGE_KEY = 'theme-preference'

const applyTheme = (theme: 'dark' | 'light') => {
  const root = document.documentElement
  if (theme === 'light') {
    root.dataset.theme = 'light'
  } else {
    root.removeAttribute('data-theme')
  }
}

const getStoredTheme = (): 'dark' | 'light' | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export default function ThemeToggle() {
  const { trackThemeToggle } = useAnalytics()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = getStoredTheme()
    const nextTheme = stored ?? 'dark'
    setTheme(nextTheme)
    applyTheme(nextTheme)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    applyTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {}
  }, [ready, theme])

  if (!ready) return null

  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type='button'
      onClick={() => {
        trackThemeToggle({ from: theme, to: nextTheme })
        setTheme(nextTheme)
      }}
      aria-pressed={theme === 'light'}
      aria-label={`Switch to ${nextTheme} theme`}
      className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono uppercase tracking-wide text-white/70 transition hover:bg-white/10 hover:text-white'
    >
      {theme}
    </button>
  )
}
