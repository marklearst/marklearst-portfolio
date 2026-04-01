'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MONOKAI } from '@/lib/monokai-colors'

gsap.registerPlugin(ScrollTrigger)

interface SocialLinkData {
  name: string
  href: string
  color: string
  icon: React.ReactNode
}

function SocialLink({ link }: { link: SocialLinkData }) {
  return (
    <a
      href={link.href}
      target='_blank'
      rel='noopener noreferrer'
      className='footer-link group flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 hover:scale-105'
      style={{
        backgroundColor: `${link.color}10`,
        border: `1px solid ${link.color}30`,
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget
        target.style.boxShadow = `0 0 25px ${link.color}40, 0 0 50px ${link.color}20`
        target.style.borderColor = `${link.color}60`
        target.style.backgroundColor = `${link.color}20`
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget
        target.style.boxShadow = 'none'
        target.style.borderColor = `${link.color}30`
        target.style.backgroundColor = `${link.color}10`
      }}
    >
      <span style={{ color: link.color }}>{link.icon}</span>
      <span className='font-mono text-sm' style={{ color: link.color }}>
        {link.name}
      </span>
    </a>
  )
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial state explicitly, then animate
      gsap.set('.footer-content', { opacity: 0, y: 40 })
      gsap.set('.footer-link', { opacity: 0, y: 20 })

      gsap.to('.footer-content', {
        scrollTrigger: {
          trigger: '.footer-content',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'expo.out',
      })

      gsap.to('.footer-link', {
        scrollTrigger: {
          trigger: '.footer-links',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out',
      })

      // Fallback: ensure visibility after a delay in case ScrollTrigger doesn't fire
      setTimeout(() => {
        gsap.to('.footer-content', { opacity: 1, y: 0, duration: 0.5 })
        gsap.to('.footer-link', {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
        })
      }, 2000)
    }, footerRef)

    return () => ctx.revert()
  }, [])

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/marklearst',
      color: MONOKAI.cyan,
      icon: (
        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
          <path
            fillRule='evenodd'
            d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
            clipRule='evenodd'
          />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/in/marklearst',
      color: MONOKAI.purple,
      icon: (
        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
        </svg>
      ),
    },
    {
      name: 'Email',
      href: 'mailto:github@marklearst.com',
      color: MONOKAI.pink,
      icon: (
        <svg
          className='w-5 h-5'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
          />
        </svg>
      ),
    },
  ]

  return (
    <footer
      ref={footerRef}
      className='bg-black relative py-20 px-6 border-t border-white/5 overflow-hidden'
    >
      {/* Background elements */}
      <div className='absolute inset-0'>
        <div className='absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px]' />
        <div className='absolute top-0 right-1/3 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]' />
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        <div className='footer-content grid md:grid-cols-2 gap-12 mb-16'>
          {/* Brand */}
          <div className='md:pr-3'>
            <h3 className='text-3xl font-mono lowercase mb-4 tracking-tight'>
              marklearst
            </h3>
            <p className='text-white/50 text-sm leading-relaxed mb-6 font-mono whitespace-normal break-normal text-balance'>
              I architect design systems, build developer tools designers
              actually want to use, and ship open-source that solves real
              problems.
            </p>
            <div className='inline-block px-3 py-1.5 bg-white/5 border border-white/10 rounded-full'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
                <span className='font-mono text-xs text-white/60'>
                  Available for Remote full-time roles
                </span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className='footer-links'>
            <h4 className='text-sm font-mono uppercase tracking-wider text-white/40 mb-6'>
              Connect
            </h4>
            <div className='flex flex-wrap gap-4'>
              {socialLinks.map((link) => (
                <SocialLink key={link.name} link={link} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='pt-8 border-t border-white/5'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <div className='font-mono text-xs text-white/30'>
              <span>© 2026 Mark Learst.</span>
              <span className='mx-2'>•</span>
              <span>Crafted with precision</span>
            </div>

            <div className='flex items-center gap-6'>
              <div className='font-mono text-xs text-white/20'>
                <span className='text-teal-400/50'>v</span>2026.1.0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className='absolute bottom-0 left-0 w-32 h-32 border-l border-b border-white/5 rounded-bl-3xl' />
      <div className='absolute top-0 right-0 w-32 h-32 border-r border-t border-white/5 rounded-tr-3xl' />
    </footer>
  )
}
