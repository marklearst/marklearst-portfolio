import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import TerminalNavigationProvider from '@/components/transitions/TerminalNavigationProvider'
import ParticleHeader from '@/components/brand/ParticleHeader'
import NeuralBackground from '@/components/brand/NeuralBackground'
import PrimaryNav from '@/components/PrimaryNav'
import CursorOrbs from '@/components/ui/CursorOrbs'
import KonamiCode from '@/components/ui/KonamiCode'
import ScrollProgress from '@/components/ui/ScrollProgress'
import CommandPalette from '@/components/ui/CommandPalette'
import SmoothScrollProvider from '@/components/SmoothScrollProvider'
import FigmaVarsContextProvider from '@/components/providers/FigmaVarsProvider'
import FigmaVarsDebug from '@/components/dev/FigmaVarsDebug'
import AnalyticsManager from '@/components/AnalyticsManager'
import NavigationHistoryTracker from '@/components/NavigationHistoryTracker'

export const metadata: Metadata = {
  metadataBase: new URL('https://marklearst.com'),
  title:
    'Mark Learst | Senior Design Engineer (Design Systems, React, Accessibility, DX + AI Tooling)',
  description:
    'Senior Design Engineer focused on design systems, React + TypeScript, accessibility, and DX + AI tooling. Built Aurora at GM across 4 brands with 60% component reuse. OSS maintainer building tools designers and developers actually want to use.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <NeuralBackground />

        {/* Global animated Monokai gradient line - appears on all pages */}
        <div className='top-0 left-0 right-0 h-1 z-50'>
          <div
            className='w-full h-full animate-gradient-x'
            style={{
              background:
                'linear-gradient(90deg, #ff6188, #fb9866, #ffd866, #a9dc75, #78dce8, #ab9df2, #ff6188)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>

        {/* Scroll progress indicator - below the gradient line */}
        <ScrollProgress />

        {/* Header with ML logo - staggered entrance */}
        <header className='fixed top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 z-40 flex items-center justify-between gap-4'>
          <div className='opacity-0 animate-[fadeIn_0.5s_ease-out_0.8s_forwards]'>
            <ParticleHeader />
          </div>
          <div className='opacity-0 animate-[fadeIn_0.5s_ease-out_1s_forwards]'>
            <PrimaryNav />
          </div>
        </header>

        {/* Monokai cursor orbs - premium cursor trail */}
        <CursorOrbs />

        {/* Easter egg - Konami code */}
        <KonamiCode />

        <FigmaVarsContextProvider>
          <SmoothScrollProvider>
            <TerminalNavigationProvider>{children}</TerminalNavigationProvider>
          </SmoothScrollProvider>
          <FigmaVarsDebug />
        </FigmaVarsContextProvider>
        <CommandPalette />
        <AnalyticsManager />
        <NavigationHistoryTracker />
        <SpeedInsights />
      </body>
    </html>
  )
}
