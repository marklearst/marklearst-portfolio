import Hero from '@/components/home/Hero'
import FeaturedWork from '@/components/home/FeaturedWork'
import Testimonials from '@/components/home/Testimonials'
import Footer from '@/components/shell/Footer'

const SITE = 'https://marklearst.com'

// Who the site is about and what it is, in the form search engines read. The profile links are the ones in the footer.
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE}/#person`,
      name: 'Mark Learst',
      url: SITE,
      jobTitle: 'Design Engineer',
      description: 'Design engineer and UI architect who works on design systems, design tokens, React components, and accessibility.',
      sameAs: ['https://github.com/marklearst', 'https://linkedin.com/in/marklearst'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: SITE,
      name: 'Mark Learst',
      description: 'Design systems, React components, and developer tools by Mark Learst.',
      inLanguage: 'en',
      author: { '@id': `${SITE}/#person` },
    },
  ],
}

export default function Home() {
  return (
    <div className='relative'>
      <main>
        {/* A "<" is escaped so nothing in the data can close the script element. */}
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
        <Hero />
        <FeaturedWork />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
