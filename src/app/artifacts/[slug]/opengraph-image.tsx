import { ImageResponse } from 'next/og'
import { getArtifactBySlug } from '@/lib/content/artifacts'
import { MONOKAI } from '@/lib/monokai-colors'
import fs from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'

export const alt = 'Artifact'
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
  const artifact = await getArtifactBySlug(slug)

  const dateStr = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(artifact.publishedAt)

  // Load logo
  let logoData = ''
  try {
    const logoBuffer = await fs.readFile(
      path.join(process.cwd(), 'public/logo.png'),
    )
    logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`
  } catch {
    // Fallback if logo doesn't exist
  }

  // Load custom monospace font - DISABLED
  // MonoLisa contains OpenType features (lookupType: 6) not supported by Satori
  // Use system monospace as fallback
  const monoFont: ArrayBuffer | undefined = undefined

  // Assign vibrant colors to tags for visual variety
  const tagColors = [
    { bg: MONOKAI.pink, border: MONOKAI.pink, text: MONOKAI.background },
    { bg: MONOKAI.cyan, border: MONOKAI.cyan, text: MONOKAI.background },
    { bg: MONOKAI.green, border: MONOKAI.green, text: MONOKAI.background },
    { bg: MONOKAI.yellow, border: MONOKAI.yellow, text: MONOKAI.background },
    { bg: MONOKAI.orange, border: MONOKAI.orange, text: MONOKAI.background },
    { bg: MONOKAI.purple, border: MONOKAI.purple, text: MONOKAI.background },
  ]

  return new ImageResponse(
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
      {/* Enhanced Background Gradients - More vibrant */}
      <div
        style={{
          position: 'absolute',
          top: '-180px',
          left: '-180px',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${MONOKAI.cyan}40 0%, transparent 70%)`,
          filter: 'blur(140px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-140px',
          right: '-140px',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${MONOKAI.purple}40 0%, transparent 70%)`,
          filter: 'blur(130px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '35%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${MONOKAI.pink}20 0%, transparent 65%)`,
          filter: 'blur(110px)',
        }}
      />

      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '50px',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: MONOKAI.foreground,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            letterSpacing: '-0.01em',
            fontFamily: monoFont ? 'MonoLisa' : 'monospace',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ display: 'flex' }}>marklearst</span>
            <span style={{ display: 'flex' }}>.</span>
            <span
              style={{
                display: 'flex',
                color: MONOKAI.pink,
              }}
            >
              artifacts
            </span>
          </span>
        </div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: MONOKAI.yellow,
            letterSpacing: '-0.01em',
          }}
        >
          {dateStr}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: '80px',
            fontWeight: 900,
            color: MONOKAI.foreground,
            lineHeight: 1.02,
            marginBottom: '48px',
            maxWidth: '980px',
            textTransform: 'lowercase',
            letterSpacing: '-0.035em',
          }}
        >
          {artifact.title}
        </div>

        {/* Tags - Now with vibrant individual colors */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            marginTop: 'auto',
          }}
        >
          {artifact.tags.map((tag, index) => {
            const colorScheme = tagColors[index % tagColors.length]
            return (
              <div
                key={tag}
                style={{
                  padding: '10px 26px 14px',
                  borderRadius: '100px',
                  backgroundColor: colorScheme.bg,
                  color: colorScheme.text,
                  fontSize: '23px',
                  fontWeight: 'bold',
                  fontFamily: monoFont ? 'MonoLisa' : 'monospace',
                  letterSpacing: '-0.005em',
                  textTransform: 'lowercase',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {tag}
              </div>
            )
          })}
        </div>
      </div>

      {/* Enhanced Accent Line - Thicker, more vibrant */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '12px',
          background: `linear-gradient(90deg, ${MONOKAI.pink} 0%, ${MONOKAI.orange} 16.67%, ${MONOKAI.yellow} 33.33%, ${MONOKAI.green} 50%, ${MONOKAI.cyan} 66.67%, ${MONOKAI.purple} 83.33%, ${MONOKAI.pink} 100%)`,
        }}
      />
      {logoData && (
        <img
          src={logoData}
          alt=''
          width='80'
          height='51'
          style={{
            borderRadius: '6px',
            position: 'absolute',
            bottom: '80px',
            right: '80px',
            opacity: 0.25,
          }}
        />
      )}
    </div>,
    {
      ...size,
      fonts:
        monoFont ?
          [
            {
              name: 'MonoLisa',
              data: monoFont,
              style: 'normal',
              weight: 400,
            },
          ]
        : undefined,
    },
  )
}
