'use client'

import { GithubIcon, LinkedinIcon, MailIcon, ArrowUpRightIcon } from '@/components/ui/Icon'

import React, { useRef } from 'react'
import Link from 'next/link'
import { useAnalytics, useSectionViewTracking } from '@/hooks/useAnalytics'
import AnalyticsOptOutToggle from '@/components/ui/AnalyticsOptOutToggle'
import { usePathname } from 'next/navigation'

import styles from './Footer.module.css'

interface SocialLinkData {
  name: string
  href: string
  icon: React.ReactNode
}

function SocialLink({ link }: { link: SocialLinkData }) {
  const { trackSocialLinkClick, getPlatformFromUrl } = useAnalytics()
  const platform = getPlatformFromUrl(link.href) as
    | 'github'
    | 'linkedin'
    | 'email'
    | 'buy-me-a-coffee'

  return (
    <a
      href={link.href}
      target='_blank'
      rel='noopener noreferrer'
      onClick={() => {
        trackSocialLinkClick({
          platform,
          href: link.href,
        })
      }}
      className={styles.socialLink}
    >
      <span
        className={styles.icon}
        aria-hidden='true'
      >
        {link.icon}
      </span>
      <span>
        {link.name}
      </span>
    </a>
  )
}

export default function Footer() {
  const footerRef = useRef<HTMLElement | null>(null)
  const { trackNavigationClick, trackSocialLinkClick } = useAnalytics()
  const pathname = usePathname()
  const showPrivacyLink = pathname !== '/privacy'

  useSectionViewTracking({
    ref: footerRef as React.RefObject<HTMLElement>,
    section: 'footer',
    data: { location: 'global' },
  })

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/marklearst',
      icon: (
        <GithubIcon size={20} />
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/in/marklearst',
      icon: (
        <LinkedinIcon size={20} />
      ),
    },
    {
      name: 'Email',
      href: 'mailto:github@marklearst.com',
      icon: (
        <MailIcon size={20} />
      ),
    },
  ]

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.main}>
          <div>
            <h3 className={styles.name}>marklearst</h3>
            <p className={styles.availability}>
              Need a design engineer?{' '}
              <a
                href='mailto:jobs@marklearst.com?subject=Role%20inquiry&body=Hi%20Mark%2C%0D%0A%0D%0AI%20am%20reaching%20out%20about%20a%20role%20on%20our%20team.'
                onClick={() => {
                  trackSocialLinkClick({
                    platform: 'email',
                    href: 'mailto:jobs@marklearst.com?subject=Role%20inquiry&body=Hi%20Mark%2C%0D%0A%0D%0AI%20am%20reaching%20out%20about%20a%20role%20on%20our%20team.',
                  })
                }}
              >
                Let’s talk <span aria-hidden='true'><ArrowUpRightIcon /></span>
              </a>
            </p>
          </div>
          <nav className={styles.socialLinks} aria-label='Contact and profiles'>
            {socialLinks.map((link) => <SocialLink key={link.name} link={link} />)}
          </nav>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copyright}>© 2026 Mark Learst.</span>
          <div className={styles.controls}>
            <a
              href='https://www.buymeacoffee.com/marklearst'
              target='_blank'
              rel='noopener noreferrer'
              onClick={() => {
                trackSocialLinkClick({
                  platform: 'buy-me-a-coffee',
                  href: 'https://www.buymeacoffee.com/marklearst',
                })
              }}
            >
              Buy Me a Coffee
            </a>
            <AnalyticsOptOutToggle />
            {showPrivacyLink && (
              <Link
                href='/privacy'
                onClick={() => {
                  trackNavigationClick({
                    action: 'privacy_page',
                    to: '/privacy',
                    location: 'footer',
                  })
                }}
              >
                Privacy
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
