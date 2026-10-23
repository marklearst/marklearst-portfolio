import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '../styles/globals.css'
import SiteHeader from '@/components/shell/SiteHeader'
import PageTransition from '@/components/transitions/PageTransition'
import AnalyticsManager from '@/components/analytics/AnalyticsManager'
import NavigationHistoryTracker from '@/components/navigation/NavigationHistoryTracker'

// Production builds replace NODE_ENV, so these imports and the inspector's
// dependencies drop out of the production bundle.
const isDev = process.env.NODE_ENV !== 'production'
const FigmaVarsContextProvider = isDev ? dynamic(() => import('@/components/dev/FigmaVarsProvider')) : null
const FigmaVarsDebug = isDev ? dynamic(() => import('@/components/dev/FigmaVarsDebug')) : null

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
        <link rel='preload' href='/fonts/wotfard/wotfard-regular-webfont.woff2' as='font' type='font/woff2' crossOrigin='anonymous' />
        <link rel='preload' href='/fonts/wotfard/wotfard-medium-webfont.woff2' as='font' type='font/woff2' crossOrigin='anonymous' />
      </head>
      <body>
        <a className='skip-link' href='#page-content'>Skip to content</a>

        <SiteHeader />

        <PageTransition>{children}</PageTransition>
        {FigmaVarsContextProvider && FigmaVarsDebug && (
          <FigmaVarsContextProvider>
            <FigmaVarsDebug />
          </FigmaVarsContextProvider>
        )}
        <AnalyticsManager />
        <NavigationHistoryTracker />
        <SpeedInsights />
      </body>
    </html>
  )
}
