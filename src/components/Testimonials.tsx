'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useSectionViewTracking } from '@/hooks/useAnalytics'
import styles from './Testimonials.module.css'

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
      className={styles.section}
    >
      <div className={styles.container}>
        <h2
          id='testimonials-heading'
          className={styles.heading}
        >
          what colleagues say
        </h2>

        <div className={styles.quotes}>
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.author}
              className={styles.quote}
            >
              <blockquote className={styles.words}>
                <p>“{testimonial.quote}”</p>
              </blockquote>

              <figcaption className={styles.author}>
                {testimonial.image && (
                  <Image
                    src={testimonial.image}
                    alt=''
                    width={44}
                    height={44}
                    className={styles.portrait}
                  />
                )}
                <div>
                  <p className={styles.name}>
                    {testimonial.author}
                  </p>
                  <p className={styles.role}>
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
