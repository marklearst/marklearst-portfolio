import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import Wordmark from '@/components/brand/Wordmark'
import PrimaryNav from '@/components/PrimaryNav'
import PageTransition from '@/components/transitions/PageTransition'
import FigmaVarsContextProvider from '@/components/providers/FigmaVarsProvider'
import FigmaVarsDebug from '@/components/dev/FigmaVarsDebug'
import AnalyticsManager from '@/components/AnalyticsManager'
import NavigationHistoryTracker from '@/components/NavigationHistoryTracker'

export const metadata: Metadata = {
  metadataBase: new URL('https://marklearst.com'),
  title: 'Mark Learst | Design Engineer & UI Architect',
  description:
    'Design systems, React components, and developer tools by Mark Learst. Explore case studies and working examples.',
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
      <head>
        <link rel='preload' href='/fonts/dm-sans/dm-sans-latin-normal.woff2' as='font' type='font/woff2' crossOrigin='anonymous' />
      </head>
      <body>
        <a className='skip-link' href='#page-content'>Skip to content</a>

        <header className='site-header'>
          <div className='site-header-inner'>
            <Wordmark />
            <PrimaryNav />
          </div>
        </header>

        <FigmaVarsContextProvider>
          <PageTransition>{children}</PageTransition>
          {process.env.NODE_ENV !== 'production' && <FigmaVarsDebug />}
        </FigmaVarsContextProvider>
        <AnalyticsManager />
        <NavigationHistoryTracker />
        <SpeedInsights />
      </body>
    </html>
  )
}
