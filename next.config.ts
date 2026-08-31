import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [['remark-gfm', {}]],
  },
})

const nextConfig: NextConfig = {
  reactCompiler: true,
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // Phosphor's barrel export is ~9k icons; without this every import pulls the lot.
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
}

export default withMDX(nextConfig)
