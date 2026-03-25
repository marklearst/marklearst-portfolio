'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MONOKAI } from '@/lib/monokai-colors'
import Link from 'next/link'
import Footer from './Footer'

gsap.registerPlugin(ScrollTrigger)

// Category icon helper - matches FeaturedWork icons
const getCategoryIcon = (category: string) => {
  const iconStyle = { width: '14px', height: '14px' }

  switch (category) {
    case 'Design Systems':
    case 'DESIGN SYSTEMS':
      return (
        <svg
          style={iconStyle}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z'
          />
        </svg>
      )
    case 'Developer Tools':
    case 'DEVELOPER TOOLS':
      return (
        <svg
          style={iconStyle}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
          />
        </svg>
      )
    case 'Accessibility':
    case 'ACCESSIBILITY':
      return (
        <svg
          style={iconStyle}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
          />
        </svg>
      )
    case 'Health Tech':
    case 'HEALTH TECH':
      return (
        <svg
          style={iconStyle}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
          />
        </svg>
      )
    case 'Standards':
    case 'STANDARDS':
      return (
        <svg
          style={iconStyle}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
      )
    case 'Consulting':
    case 'CONSULTING':
      return (
        <svg
          style={iconStyle}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
          />
        </svg>
      )
    default:
      return null
  }
}

interface CaseStudySection {
  title: string
  content: ReactNode
}

interface CaseStudyLayoutProps {
  title: string
  category: string
  categoryColor: 'pink' | 'orange' | 'yellow' | 'green' | 'cyan' | 'purple'
  description: string
  role: string
  timeline: string
  technologies: string[]
  links?: { label: string; href: string; icon?: ReactNode }[]
  sections: CaseStudySection[]
  impact?: { metric: string; description: string }[]
  gradient: string
}

export default function CaseStudyLayout({
  title,
  category,
  categoryColor,
  description,
  role,
  timeline,
  technologies,
  links = [],
  sections,
  impact,
  gradient,
}: CaseStudyLayoutProps) {
  const pageRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      const tl = gsap.timeline({ delay: 0.2 })

      tl.fromTo(
        '.case-study-category',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      )

      tl.fromTo(
        '.case-study-title',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.4',
      )

      tl.fromTo(
        '.case-study-description',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4',
      )

      tl.fromTo(
        '.case-study-meta',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
        '-=0.3',
      )

      // Section reveals
      gsap.utils
        .toArray<HTMLElement>('.case-study-section')
        .forEach((section) => {
          gsap.from(section, {
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
            },
            opacity: 0,
            y: 60,
            duration: 1,
            ease: 'power3.out',
          })
        })
    }, pageRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={pageRef}
      className='min-h-screen'
      style={{ backgroundColor: MONOKAI.background }}
    >
      {/* Hero Section */}
      <section
        ref={heroRef}
        className='relative pt-40 pb-20 px-6 overflow-hidden'
      >
        {/* Background gradient */}
        <div className='absolute inset-0 opacity-20'>
          <div
            className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] bg-linear-to-br ${gradient}`}
          />
        </div>

        <div className='max-w-5xl mx-auto relative z-10'>
          {/* Back button */}
          <Link
            href='/#work'
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
            Back to work
          </Link>

          {/* Category */}
          <div className='case-study-category flex items-center gap-3 mb-6 opacity-0'>
            <div style={{ color: MONOKAI[categoryColor] }}>
              {getCategoryIcon(category)}
            </div>
            <span
              className='text-xs font-mono uppercase tracking-wider'
              style={{ color: MONOKAI[categoryColor] }}
            >
              {category}
            </span>
          </div>

          {/* Title */}
          <h1
            className='case-study-title text-[clamp(48px,8vw,96px)] font-mono font-bold! lowercase leading-[0.9] mb-8 opacity-0'
            style={{ color: MONOKAI.foreground }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            className='case-study-description text-[clamp(20px,2.5vw,28px)] leading-relaxed mb-16 max-w-3xl opacity-0'
            style={{ color: `${MONOKAI.foreground}cc` }}
          >
            {description}
          </p>

          {/* Meta Grid */}
          <div className='grid md:grid-cols-3 gap-8 mb-12'>
            <div className='case-study-meta opacity-0'>
              <div
                className='text-xs font-mono uppercase tracking-wider mb-2'
                style={{ color: `${MONOKAI.foreground}50` }}
              >
                Role
              </div>
              <div
                className='text-base font-mono'
                style={{ color: `${MONOKAI.foreground}cc` }}
              >
                {role}
              </div>
            </div>

            <div className='case-study-meta opacity-0'>
              <div
                className='text-xs font-mono uppercase tracking-wider mb-2'
                style={{ color: `${MONOKAI.foreground}50` }}
              >
                Timeline
              </div>
              <div
                className='text-base font-mono'
                style={{ color: `${MONOKAI.foreground}cc` }}
              >
                {timeline}
              </div>
            </div>

            <div className='case-study-meta opacity-0'>
              <div
                className='text-xs font-mono uppercase tracking-wider mb-2'
                style={{ color: `${MONOKAI.foreground}50` }}
              >
                Technologies
              </div>
              <div className='flex flex-wrap gap-2'>
                {technologies.map((tech) => (
                  <span
                    key={tech}
                    className='px-2 py-1 text-xs font-mono rounded'
                    style={{
                      backgroundColor: `${MONOKAI[categoryColor]}20`,
                      color: MONOKAI[categoryColor],
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Links */}
          {links.length > 0 && (
            <div className='case-study-meta flex flex-wrap gap-4 opacity-0'>
              {links.map((link) => {
                const isDisabled = !link.href || link.href === ''

                return (
                  <a
                    key={link.label}
                    href={isDisabled ? undefined : link.href}
                    target={isDisabled ? undefined : '_blank'}
                    rel={isDisabled ? undefined : 'noopener noreferrer'}
                    className='inline-flex items-center gap-2 px-4 py-2 font-mono text-sm rounded-lg transition-all duration-300'
                    style={{
                      backgroundColor: `${MONOKAI[categoryColor]}20`,
                      color: MONOKAI[categoryColor],
                      border: `1px solid ${MONOKAI[categoryColor]}40`,
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      transform: isDisabled ? 'none' : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!isDisabled) {
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDisabled) {
                        e.currentTarget.style.transform = 'scale(1)'
                      }
                    }}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault()
                      }
                    }}
                  >
                    {link.icon}
                    {link.label}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Impact Section */}
      {impact && impact.length > 0 && (
        <section className='py-20 px-6'>
          {/* Subtle divider line matching content width */}
          <div className='max-w-5xl mx-auto mb-20'>
            <div
              className='h-px w-full'
              style={{ backgroundColor: `${MONOKAI.foreground}15` }}
            />
          </div>
          <div className='max-w-5xl mx-auto'>
            <h2
              className='text-sm font-mono uppercase tracking-wider mb-12'
              style={{ color: `${MONOKAI.foreground}50` }}
            >
              Impact
            </h2>
            <div className='grid md:grid-cols-3 gap-12'>
              {impact.map((item, index) => (
                <div key={index} className='case-study-section'>
                  <div
                    className='text-[clamp(32px,5vw,48px)] font-mono font-bold mb-3'
                    style={{ color: MONOKAI[categoryColor] }}
                  >
                    {item.metric}
                  </div>
                  <p
                    className='text-sm leading-relaxed'
                    style={{ color: `${MONOKAI.foreground}80` }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* Bottom divider line matching content width */}
          <div className='max-w-5xl mx-auto mt-20'>
            <div
              className='h-px w-full'
              style={{ backgroundColor: `${MONOKAI.foreground}15` }}
            />
          </div>
        </section>
      )}

      {/* Content Sections */}
      <section className='py-20 px-6'>
        <div className='max-w-5xl mx-auto space-y-20'>
          {sections.map((section, index) => (
            <div key={index} className='case-study-section'>
              <h2
                className='text-[clamp(28px,4vw,42px)] font-mono lowercase mb-8'
                style={{ color: MONOKAI.foreground }}
              >
                {section.title}
              </h2>
              <div
                className='prose prose-invert max-w-none'
                style={{ color: `${MONOKAI.foreground}cc` }}
              >
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Footer */}
      <section className='py-16 px-6'>
        {/* Subtle divider line matching content width */}
        <div className='max-w-5xl mx-auto mb-16'>
          <div
            className='h-px w-full'
            style={{ backgroundColor: `${MONOKAI.foreground}10` }}
          />
        </div>
        <div className='max-w-5xl mx-auto flex justify-center'>
          <Link
            href='/#work'
            className='inline-flex items-center gap-2 px-6 py-3 font-mono text-sm rounded-lg transition-all duration-300 hover:scale-105'
            style={{
              backgroundColor: `${MONOKAI.foreground}10`,
              color: MONOKAI.foreground,
            }}
          >
            <svg
              className='w-4 h-4'
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
            View all projects
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
