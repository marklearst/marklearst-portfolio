'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useLastRoute } from '@/hooks/useNavigationHistory'
import { useAnalytics } from '@/hooks/useAnalytics'
import { PROJECTS_BY_ROUTE, PROJECTS_BY_SLUG } from '@/data/projects'
import { MONOKAI } from '@/lib/monokai-colors'

const getLabelFromPath = (path: string) => {
  if (!path || path === '/') return 'home'

  if (path.startsWith('/#') || path.startsWith('/?#')) {
    const hash = path.split('#')[1]
    return hash ? hash.replace(/-/g, ' ') : 'home'
  }

  if (path.startsWith('/work/')) {
    const slug = path.split('/work/')[1]?.split(/[?#]/)[0]
    if (!slug) return 'work'
    const project =
      PROJECTS_BY_SLUG[slug] ??
      Object.values(PROJECTS_BY_ROUTE).find((item) => item.slug === slug)
    return project?.cardTitle || project?.title || 'case study'
  }

  if (path.startsWith('/work')) return 'work'

  const segment = path.split('/')[1]
  return segment ? segment.replace(/-/g, ' ') : 'home'
}

export default function PrivacyBackLink() {
  const lastRoute = useLastRoute()
  const { trackNavigationClick } = useAnalytics()

  const { href, label } = useMemo(() => {
    const safeRoute = lastRoute || '/'
    const pathOnly = safeRoute.split('?')[0]
    return {
      href: safeRoute || '/',
      label: getLabelFromPath(pathOnly),
    }
  }, [lastRoute])

  return (
    <Link
      href={href}
      onClick={() => {
        trackNavigationClick({
          action: 'privacy_back',
          from: '/privacy',
          to: href,
          location: 'privacy',
        })
      }}
      className='inline-flex items-center gap-2 mb-12 font-mono text-sm transition-colors duration-300 group'
      style={{ color: `${MONOKAI.foreground}80` }}
    >
      <svg
        className='w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeWidth={2}
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M10 19l-7-7m0 0l7-7m-7 7h18'
        />
      </svg>
      Back to {label}
    </Link>
  )
}
