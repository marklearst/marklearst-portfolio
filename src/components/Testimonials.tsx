'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useSectionViewTracking } from '@/hooks/useAnalytics'

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

  useSectionViewTracking({
    ref: sectionRef,
    section: 'testimonials',
    data: { location: 'home' },
  })

  return (
    <section
      ref={sectionRef}
      aria-labelledby='testimonials-heading'
      className='relative px-6 py-20 sm:py-28'
    >
      <div className='mx-auto max-w-5xl'>
        <h2
          id='testimonials-heading'
          className='mb-10 font-mono text-[clamp(2rem,5vw,3.5rem)] leading-tight lowercase sm:mb-14'
        >
          what colleagues say
        </h2>

        <div className='grid gap-10 lg:grid-cols-3 lg:gap-8'>
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.author}
              className='flex flex-col border-t border-white/20 pt-6'
            >
              <blockquote className='mb-8 grow font-body text-lg leading-relaxed text-white/85'>
                <p>“{testimonial.quote}”</p>
              </blockquote>

              <figcaption className='flex items-start gap-3'>
                {testimonial.image && (
                  <Image
                    src={testimonial.image}
                    alt=''
                    width={44}
                    height={44}
                    className='shrink-0 rounded-full border border-white/15 object-cover grayscale'
                  />
                )}
                <div>
                  <p className='mb-1 font-mono text-sm font-semibold text-white'>
                    {testimonial.author}
                  </p>
                  <p className='font-body text-sm leading-relaxed text-white/65'>
                    {testimonial.role}
                    {testimonial.company && <span> · {testimonial.company}</span>}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
