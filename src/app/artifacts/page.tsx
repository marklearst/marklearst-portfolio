import type { Metadata } from 'next'
import ArtifactCard from '@/components/ArtifactCard'
import Footer from '@/components/Footer'
import { getArtifacts } from '@/lib/content/artifacts'
import { MONOKAI } from '@/lib/monokai-colors'

export const metadata: Metadata = {
  title: 'Artifacts - Mark Learst',
  description:
    'Technical writeups and experiments across design systems, motion, frontend, design engineering, and tooling.',
}

export default async function ArtifactsPage() {
  const artifacts = await getArtifacts()
  const pinned = artifacts.find((artifact) => artifact.pinned)
  const rest = artifacts.filter((artifact) => !artifact.pinned)

  return (
    <main
      className='min-h-screen relative overflow-hidden'
      style={{ backgroundColor: MONOKAI.background }}
    >
      <div className='absolute inset-0 pointer-events-none'>
        <div
          className='absolute top-1/4 left-1/4 w-[520px] h-[520px] rounded-full blur-[140px] opacity-15'
          style={{ backgroundColor: MONOKAI.cyan }}
        />
        <div
          className='absolute bottom-1/3 right-1/4 w-[520px] h-[520px] rounded-full blur-[160px] opacity-15'
          style={{ backgroundColor: MONOKAI.purple }}
        />
      </div>

      <section className='relative z-10 px-6 pt-36 pb-16'>
        <div className='max-w-6xl mx-auto'>
          <h1
            className='text-[clamp(48px,7vw,96px)] font-mono font-bold! lowercase leading-[0.9] mb-6'
            style={{ color: MONOKAI.foreground }}
          >
            artifacts
          </h1>
          <p
            className='text-[clamp(16px,2vw,22px)] leading-relaxed max-w-3xl'
            style={{ color: `${MONOKAI.foreground}b3` }}
          >
            Technical writeups and experiments across design systems, motion,
            frontend architecture, design engineering, and tooling. Short,
            sharp, and built for scanning.
          </p>
        </div>
      </section>

      <section className='relative z-10 px-6 pb-24'>
        <div className='max-w-6xl mx-auto grid gap-6 md:grid-cols-2'>
          {pinned && (
            <ArtifactCard
              featured
              slug={pinned.slug}
              title={pinned.title}
              summary={pinned.summary}
              tags={pinned.tags}
              readingTimeMinutes={pinned.readingTime.minutes}
              publishedAt={pinned.publishedAt}
              pinned={pinned.pinned}
            />
          )}
          {rest.map((artifact) => (
            <ArtifactCard
              key={artifact.slug}
              slug={artifact.slug}
              title={artifact.title}
              summary={artifact.summary}
              tags={artifact.tags}
              readingTimeMinutes={artifact.readingTime.minutes}
              publishedAt={artifact.publishedAt}
              pinned={artifact.pinned}
            />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
