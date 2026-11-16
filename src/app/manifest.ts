import type { MetadataRoute } from 'next'
import { DEFAULT_SELECTION, tokenGraph } from '@/lib/inspector/graph'

// The colors a phone paints around the site come from the same token graph the site does.
const canvas = tokenGraph().chain('semantic.color.surface.canvas', DEFAULT_SELECTION)!.value.text

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mark Learst',
    short_name: 'Mark Learst',
    description: 'Design systems, React components, and developer tools by Mark Learst.',
    start_url: '/',
    display: 'standalone',
    background_color: canvas,
    theme_color: canvas,
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
