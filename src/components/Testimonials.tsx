'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'
import Image from 'next/image'
import { useSectionViewTracking } from '@/hooks/useAnalytics'

gsap.registerPlugin(ScrollTrigger)

interface Testimonial {
  quote: string
  author: string
  role: string
  company?: string
  image?: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      'The rare developer that is the marriage of creative and technology. He elevates the aesthetic and user experience of any product he is developing.',
    author: "Stuart O'Neil",
    role: 'Executive Creative Director',
    image: '/colleagues/stu.webp',
  },
  {
    quote:
      'Master craftsman with attention to detail, deep experience and passion. Mark can make the smoothest most meaningful animations with the tiniest amount of code.',
    author: 'Doug Wojciechowski',
    role: 'Design Leader / Experience Design Director',
    image: '/colleagues/doug.webp',
  },
  {
    quote:
      "One of those rare talents that understand creative, motion and development. He's the guy that will stay up all night reading up on the latest programming frameworks.",
    author: 'Brandon Klebba',
    role: 'Senior Web Designer',
    image: '/colleagues/brandon.webp',
  },
]

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const testimonialRefs = useRef<(HTMLDivElement | null)[]>([])

  useSectionViewTracking({
    ref: sectionRef,
    section: 'testimonials',
    data: { location: 'home' },
  })

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title reveal
      gsap.from('.testimonials-title', {
        scrollTrigger: {
          trigger: '.testimonials-title',
          start: 'top 75%',
        },
        opacity: 0,
        y: 60,
        duration: 1.4,
        ease: 'expo.out',
      })

      // Subtitle reveal
      gsap.from('.testimonials-subtitle', {
        scrollTrigger: {
          trigger: '.testimonials-subtitle',
          start: 'top 75%',
        },
        opacity: 0,
        x: -20,
        duration: 1,
        delay: 0.3,
        ease: 'expo.out',
      })

      // Stagger testimonials with sophisticated timing
      testimonialRefs.current.forEach((testimonial, index) => {
        if (testimonial) {
          gsap.from(testimonial, {
            scrollTrigger: {
              trigger: testimonial,
              start: 'top 80%',
            },
            opacity: 0,
            x: -60,
            duration: 1.2,
            delay: index * 0.15,
            ease: 'expo.out',
          })

          // Accent line animation
          const accentLine = testimonial.querySelector('.accent-line')
          if (accentLine) {
            gsap.from(accentLine, {
              scrollTrigger: {
                trigger: testimonial,
                start: 'top 75%',
              },
              scaleY: 0,
              transformOrigin: 'top',
              duration: 1,
              delay: index * 0.15 + 0.3,
              ease: 'expo.out',
            })
          }
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className='py-32 px-6 relative overflow-hidden'
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Decorative gradients */}
      <div className='absolute inset-0'>
        <div className='absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]' />
      </div>

      {/* Monokai gradient line at top */}
      <div className='absolute top-0 left-0 right-0 h-1'>
        <div
          className='w-full h-full animate-gradient-x'
          style={{
            background:
              'linear-gradient(90deg, #ff6188, #fb9866, #ffd866, #a9dc75, #78dce8, #ab9df2, #ff6188)',
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      <div className='max-w-5xl mx-auto relative z-10'>
        {/* Section Header */}
        <div className='mb-20'>
          <h2 className='testimonials-title text-[clamp(48px,8vw,84px)] font-mono lowercase leading-none mb-4'>
            what colleagues say
          </h2>
          <div className='testimonials-subtitle flex items-center gap-3 font-mono text-sm text-white/30'>
            <span>{'//  '}</span>
            <span>Testimonials from industry leaders</span>
          </div>
        </div>

        {/* Testimonials */}
        <div className='space-y-16'>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.author}
              testimonial={testimonial}
              ref={(el) => {
                testimonialRefs.current[index] = el
              }}
            />
          ))}
        </div>
      </div>

      {/* Large decorative quote mark */}
      <div className='absolute bottom-20 right-20 text-[280px] font-serif text-white/1.5 leading-none pointer-events-none select-none'>
        "
      </div>
    </section>
  )
}

interface TestimonialCardProps {
  testimonial: Testimonial
}

const TestimonialCard = React.forwardRef<HTMLDivElement, TestimonialCardProps>(
  ({ testimonial }, ref) => {
    return (
      <div ref={ref} className='group relative'>
        {/* Accent line with gradient */}
        <div className='accent-line absolute left-0 top-0 bottom-0 w-[3px] bg-linear-to-b from-white via-white/60 to-white/20 rounded-full' />

        <div className='pl-10'>
          {/* Quote */}
          <blockquote
            className='text-[clamp(18px,2.5vw,26px)] mb-8 text-white/90 relative font-light'
            style={{ lineHeight: '1.5' }}
          >
            <span className='absolute -left-4 -top-2 text-3xl text-white/30 font-serif'>
              "
            </span>
            {testimonial.quote}
          </blockquote>

          {/* Author info */}
          <div className='flex items-start gap-5'>
            {/* Avatar */}
            {testimonial.image ? (
              <Image
                src={testimonial.image}
                alt={testimonial.author}
                width={56}
                height={56}
                className='rounded-full object-cover border-2 border-white/10 shrink-0 grayscale'
              />
            ) : (
              <div className='w-14 h-14 rounded-full bg-linear-to-br from-white/10 to-white/5 border-2 border-white/10 flex items-center justify-center font-mono text-sm text-white/50 backdrop-blur-sm shrink-0'>
                {testimonial.author
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            )}

            {/* Details */}
            <div>
              <div className='font-mono font-semibold text-white text-lg mb-1 group-hover:text-white/90 transition-colors duration-300'>
                {testimonial.author}
              </div>
              <div className='font-mono text-white/60 text-sm'>
                {testimonial.role}
                {testimonial.company && (
                  <>
                    <span className='text-white/20 mx-2'>•</span>
                    <span className='text-white/50'>{testimonial.company}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className='absolute inset-0 bg-white/1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl -z-10 blur-xl' />
      </div>
    )
  },
)

TestimonialCard.displayName = 'TestimonialCard'
