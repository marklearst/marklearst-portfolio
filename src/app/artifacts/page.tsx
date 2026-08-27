import type { Metadata } from 'next'
import ArtifactCard from '@/components/ArtifactCard'
import Footer from '@/components/Footer'
import { getArtifacts } from '@/lib/content/artifacts'
import styles from '@/components/ArtifactLayout.module.css'

export const metadata: Metadata = {
  title: 'Artifacts - Mark Learst',
  description: 'Technical writeups and experiments across design systems, motion, frontend, design engineering, and tooling.',
}

export default async function ArtifactsPage() {
  const artifacts = (await getArtifacts()).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  return (
    <main className={styles.page}>
      <div className={`${styles.container} ${styles.index}`}>
        <header className={styles.indexHeader}>
          <h1>artifacts</h1>
          <p>Notes from building: token contracts, accessibility tooling, motion, and agent workflows.</p>
        </header>
        <div>{artifacts.map((artifact) => <ArtifactCard key={artifact.slug} slug={artifact.slug} title={artifact.title} summary={artifact.summary} tags={artifact.tags} readingTimeMinutes={artifact.readingTime.minutes} publishedAt={artifact.publishedAt} pinned={artifact.pinned} />)}</div>
      </div>
      <Footer />
    </main>
  )
}
