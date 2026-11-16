import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '../styles/globals.css'
import SiteHeader from '@/components/shell/SiteHeader'
import FloatingInspector from '@/components/inspector/FloatingInspector'
import { InspectorProvider } from '@/components/inspector/InspectorProvider'
import { BUILD_CHECK, CONTEXTS, DEFAULT_SELECTION, tokenGraph } from '@/lib/inspector/graph'
import { brandReport, DEFAULT_HUE, MAX_HUE } from '@/lib/inspector/rebrand'
import PageTransition from '@/components/transitions/PageTransition'
import AnalyticsManager from '@/components/analytics/AnalyticsManager'
import NavigationHistoryTracker from '@/components/navigation/NavigationHistoryTracker'

// Production builds replace NODE_ENV, so these imports and the inspector's
// dependencies drop out of the production bundle.
const isDev = process.env.NODE_ENV !== 'production'
const FigmaVarsContextProvider = isDev ? dynamic(() => import('@/components/dev/FigmaVarsProvider')) : null
const FigmaVarsDebug = isDev ? dynamic(() => import('@/components/dev/FigmaVarsDebug')) : null

// Runs before first paint. The motion context is a data attribute, so a visitor
// who asked their system for less motion, or chose it here, never sees a frame
// of the default. Without scripts, tokens.css falls back to the media query.
//
// It also marks the first page of a session, so the hero's token chain resolves
// row by row once and then stays out of the way.
const contextScript = `(function(){var d=document.documentElement;try{var m=localStorage.getItem('ml:motion');d.dataset.motion=m==='reduced'||m==='default'?m:matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'default';if(!sessionStorage.getItem('ml:intro')){sessionStorage.setItem('ml:intro','1');d.dataset.intro=''}}catch(e){}})()`

const revealUnder = (motion: string) =>
  tokenGraph().chain('semantic.duration.reveal', { ...DEFAULT_SELECTION, motion })?.value.text ?? ''
const reveal = { default: revealUnder('default'), reduced: revealUnder('reduced'), slow: revealUnder('slow') }

// The accent as built, so the dock can say what it started as before the engine loads.
const brand = { built: brandReport(DEFAULT_HUE, CONTEXTS.theme.default), max: MAX_HUE }

export const metadata: Metadata = {
  metadataBase: new URL('https://marklearst.com'),
  title: 'Mark Learst | Design Engineer & UI Architect',
  description:
    'Design systems, React components, and developer tools by Mark Learst. Explore case studies and working examples.',
  // Each page is its own canonical address: the path resolves against the route that renders it.
  alternates: { canonical: './' },
  openGraph: { type: 'website', siteName: 'Mark Learst', locale: 'en_US', url: './' },
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
}

// The browser's own chrome takes the page's color, read from the token graph like everything else.
export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: tokenGraph().chain('semantic.color.surface.canvas', DEFAULT_SELECTION)?.value.text,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: contextScript }} />
        <link rel='preload' href='/fonts/wotfard/wotfard-regular-webfont.woff2' as='font' type='font/woff2' crossOrigin='anonymous' />
        <link rel='preload' href='/fonts/wotfard/wotfard-medium-webfont.woff2' as='font' type='font/woff2' crossOrigin='anonymous' />
      </head>
      <body>
        <a className='skip-link' href='#page-content'>Skip to content</a>

        <InspectorProvider check={BUILD_CHECK} reveal={reveal} brand={brand}>
          <SiteHeader />
          <PageTransition>{children}</PageTransition>
          <FloatingInspector />
        </InspectorProvider>
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
