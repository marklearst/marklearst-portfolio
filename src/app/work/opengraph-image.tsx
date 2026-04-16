import { ImageResponse } from 'next/og'
import { MONOKAI } from '@/lib/monokai-colors'
import fs from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'

export const alt = 'Work'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
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
          background: `radial-gradient(circle, ${MONOKAI.cyan}20 0%, transparent 70%)`,
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
          background: `radial-gradient(circle, ${MONOKAI.purple}20 0%, transparent 70%)`,
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
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: MONOKAI.foreground,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ opacity: 0.5 }}>{'{'}</span>
            <span>marklearst</span>
            <span style={{ opacity: 0.5 }}>{'}'}</span>
          </div>
        </div>
        <div
          style={{
            fontSize: '24px',
            color: `${MONOKAI.yellow}`,
          }}
        >
          v2026.1.0
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: '84px',
            fontWeight: 800,
            color: MONOKAI.foreground,
            lineHeight: 1,
            marginBottom: '32px',
            textTransform: 'lowercase',
          }}
        >
          All Work
        </div>

        <div
          style={{
            fontSize: '32px',
            color: 'rgba(252, 252, 250, 0.65)',
            lineHeight: 1.5,
            maxWidth: '850px',
          }}
        >
          A full archive of case studies, open source tools, and design system
          work.
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
          background: `linear-gradient(90deg, ${MONOKAI.pink}, ${MONOKAI.orange}, ${MONOKAI.yellow}, ${MONOKAI.green}, ${MONOKAI.cyan}, ${MONOKAI.purple}, ${MONOKAI.pink})`,
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
          }}
        />
      )}
    </div>,
    {
      ...size,
    },
  )
}
