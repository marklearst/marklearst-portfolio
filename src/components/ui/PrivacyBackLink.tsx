'use client'

import { ArrowLeftIcon } from '@/components/ui/Icon'

import { useMemo } from 'react'
import Link from 'next/link'
import { useLastRoute } from '@/hooks/useNavigationHistory'
import { useAnalytics } from '@/hooks/useAnalytics'
import { PROJECTS_BY_ROUTE, PROJECTS_BY_SLUG } from '@/data/projects'
import styles from '@/app/privacy/PrivacyPage.module.css'

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
      className={styles.backLink}
    >
      <ArrowLeftIcon size={18} />
      Back to {label}
    </Link>
  )
}
