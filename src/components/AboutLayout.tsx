import { isValidElement, ReactNode } from 'react'
import Footer from '@/components/Footer'
import { CaseStudySection as CaseStudySectionMarker } from '@/components/CaseStudySection'
import { MONOKAI } from '@/lib/monokai-colors'

type AboutSection = {
  title: string
  content: ReactNode
}

const extractSections = (children: ReactNode): AboutSection[] => {
  const sections: AboutSection[] = []

  const collectSections = (node: ReactNode) => {
    if (Array.isArray(node)) {
      node.forEach(collectSections)
      return
    }
    if (!isValidElement(node)) return
    const element = node as React.ReactElement<{
      title?: string
      children?: ReactNode
    }>

    if (element.type === CaseStudySectionMarker) {
      const { title, children: sectionContent } = element.props

      if (title) {
        sections.push({ title, content: sectionContent ?? null })
      }
      return
    }

    if (element.props.children !== undefined) {
      collectSections(element.props.children)
    }
  }

  collectSections(children)

  return sections
}

export default function AboutLayout({
  title,
  summary,
  children,
}: {
  title: string
  summary: string
  children: ReactNode
}) {
  const sections = extractSections(children)

  return (
    <main
      className='min-h-screen relative overflow-hidden'
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
        <div className='max-w-5xl mx-auto'>
          <h1
            className='text-[clamp(48px,7vw,96px)] font-mono font-bold! lowercase leading-[0.9] mb-6'
            style={{ color: MONOKAI.foreground }}
          >
            {title}
          </h1>
          <p
            className='text-[clamp(16px,2vw,22px)] leading-relaxed max-w-3xl'
            style={{ color: `${MONOKAI.foreground}b3` }}
          >
            {summary}
          </p>
        </div>
      </section>

      <section className='relative z-10 px-6 pb-32'>
        <div className='max-w-5xl mx-auto space-y-16'>
          {sections.map((section, index) => (
            <div key={index}>
              <h2
                className='text-[clamp(28px,4vw,42px)] font-mono lowercase mb-6'
                style={{ color: MONOKAI.foreground }}
              >
                {section.title}
              </h2>
              <div
                className='space-y-4 [&_ul]:mt-4'
                style={{ color: `${MONOKAI.foreground}cc` }}
              >
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
