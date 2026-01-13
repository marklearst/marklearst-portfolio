import type { Metadata } from 'next'
import Link from 'next/link'
import { MONOKAI } from '@/lib/monokai-colors'
import PrivacyBackLink from '@/components/ui/PrivacyBackLink'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy - Mark Learst',
  description:
    'Privacy details for marklearst.com, including anonymous analytics and opt-out controls.',
}

export default function PrivacyPage() {
  return (
    <main
      className='min-h-screen relative overflow-hidden'
      style={{ backgroundColor: MONOKAI.background }}
    >
      <div className='absolute inset-0 pointer-events-none'>
        <div
          className='absolute top-1/4 left-1/4 w-[520px] h-[520px] rounded-full blur-[140px] opacity-20'
          style={{ backgroundColor: MONOKAI.cyan }}
        />
        <div
          className='absolute bottom-1/3 right-1/4 w-[520px] h-[520px] rounded-full blur-[160px] opacity-15'
          style={{ backgroundColor: MONOKAI.purple }}
        />
      </div>

      <div className='relative z-10 px-6 py-32'>
        <div className='max-w-4xl mx-auto'>
          <PrivacyBackLink />
          <div className='mb-12'>
            <h1
              className='text-[clamp(48px,7vw,92px)] font-mono font-bold! lowercase leading-[0.9] mb-6'
              style={{ color: MONOKAI.foreground }}
            >
              privacy
            </h1>
            <p
              className='text-[clamp(16px,2vw,20px)] leading-relaxed max-w-3xl'
              style={{ color: `${MONOKAI.foreground}b3` }}
            >
              This site uses Vercel Web Analytics to understand which pages and
              projects resonate. Data is anonymous and aggregated. No cookies,
              no ads, and no cross-site tracking.
            </p>
          </div>

          <div className='space-y-10'>
            <section>
              <h2 className='text-xl font-mono lowercase mb-3'>
                what i collect
              </h2>
              <ul
                className='ml-6 list-disc space-y-2 text-sm'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Anonymous page views and route transitions</li>
                <li>
                  Interaction events like clicks, scroll depth, and section
                  views
                </li>
                <li>
                  Case study read signals such as impressions and completion
                </li>
              </ul>
            </section>

            <section>
              <h2 className='text-xl font-mono lowercase mb-3'>
                why i collect it
              </h2>
              <p
                className='text-sm leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                The goal is clarity, not surveillance. I use the data to improve
                the site, learn which work is useful, and write more of what
                people actually want to read.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-mono lowercase mb-3'>your control</h2>
              <div
                className='rounded-xl border border-white/10 bg-white/5 p-4 text-sm'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <span className='text-white/80'>Opt out anytime:</span> use the
                "analytics on/off" toggle in the footer. Your preference is
                stored locally in your browser.
              </div>
            </section>

            <section>
              <h2 className='text-xl font-mono lowercase mb-3'>questions</h2>
              <p
                className='text-sm leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                If you have questions, reach out at{' '}
                <a
                  className='text-white/80 hover:text-white'
                  href='mailto:github@marklearst.com'
                >
                  github@marklearst.com
                </a>
                . You can also head back to the{' '}
                <Link className='text-white/80 hover:text-white' href='/'>
                  homepage
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
