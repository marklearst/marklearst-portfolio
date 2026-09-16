import { colorWithAlpha } from '@/lib/color-alpha'
import { ImageResponse } from 'next/og'
import { getCaseStudyBySlug } from '@/lib/content/case-studies'
import { MONOKAI } from '@/lib/monokai-colors'
import { getCategoryColor } from '@/lib/category-colors'
import fs from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'

export const alt = 'Work'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getCaseStudyBySlug(slug)
  const categoryColor = getCategoryColor(project.categoryColor)

  // Load static fonts for OG generation - DISABLED: MonoLisa contains Opentype features not supported by Satori
  /*
  const [fontRegular, fontBold] = await Promise.all([
    fs.readFile(
      path.join(process.cwd(), 'public/fonts/monolisa-og/ttf/MonoLisa-Regular.ttf'),
    ),
    fs.readFile(
      path.join(process.cwd(), 'public/fonts/monolisa-og/ttf/MonoLisa-Bold.ttf'),
    ),
  ])
  */

  // Load logo
  let logoData = ''
  try {
    const logoBuffer = await fs.readFile(
      path.join(process.cwd(), 'public/logo.png'),
    )
    logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: MONOKAI.background,
          padding: '80px',
          fontFamily: 'monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Gradients */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colorWithAlpha(categoryColor, 0x20 / 255)} 0%, transparent 70%)`,
            filter: 'blur(100px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colorWithAlpha(MONOKAI.purple, 0x20 / 255)} 0%, transparent 70%)`,
            filter: 'blur(100px)',
          }}
        />

        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '60px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: MONOKAI.foreground,
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {logoData && (
              <img
                src={logoData}
                alt=''
                width={48}
                height={48}
                style={{ borderRadius: '8px' }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ opacity: 0.5 }}>{'{'}</span>
              <span>marklearst</span>
              <span style={{ opacity: 0.5 }}>{'}'}</span>
              <span
                style={{ marginLeft: '12px', color: `${colorWithAlpha(MONOKAI.foreground, 0x40 / 255)}` }}
              >
                / work
              </span>
            </div>
          </div>
          <div
            style={{
              fontSize: '24px',
              color: `${colorWithAlpha(MONOKAI.foreground, 0x40 / 255)}`,
            }}
          >
            {project.timeline}
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          {/* Category Badge */}
          <div
            style={{
              display: 'flex',
              padding: '6px 16px',
              borderRadius: '4px',
              backgroundColor: `${colorWithAlpha(categoryColor, 0x15 / 255)}`,
              border: `1px solid ${colorWithAlpha(categoryColor, 0x30 / 255)}`,
              color: categoryColor,
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '24px',
              alignSelf: 'flex-start',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {project.category}
          </div>

          <div
            style={{
              fontSize: '72px',
              fontWeight: 800,
              color: MONOKAI.foreground,
              lineHeight: 1.1,
              marginBottom: '32px',
              maxWidth: '1000px',
              textTransform: 'lowercase',
            }}
          >
            {project.title}
          </div>

          <div
            style={{
              fontSize: '28px',
              color: `${colorWithAlpha(MONOKAI.foreground, 0x80 / 255)}`,
              lineHeight: 1.5,
              marginBottom: '48px',
              maxWidth: '900px',
            }}
          >
            {project.description}
          </div>

          {/* Tech Stack */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: 'auto',
            }}
          >
            {project.technologies.slice(0, 5).map((tech) => (
              <div
                key={tech}
                style={{
                  padding: '6px 16px',
                  borderRadius: '100px',
                  border: `1px solid ${colorWithAlpha(MONOKAI.foreground, 0x15 / 255)}`,
                  backgroundColor: `${colorWithAlpha(MONOKAI.foreground, 0x05 / 255)}`,
                  color: `${colorWithAlpha(MONOKAI.foreground, 0x60 / 255)}`,
                  fontSize: '18px',
                  fontWeight: 500,
                }}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Accent Line */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '8px',
            background: `linear-gradient(90deg, ${MONOKAI.pink}, ${MONOKAI.orange}, ${MONOKAI.yellow}, ${MONOKAI.green}, ${categoryColor}, ${MONOKAI.purple}, ${MONOKAI.pink})`,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
