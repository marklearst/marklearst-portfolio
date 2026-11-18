import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [['remark-gfm', {}]],
  },
})

const nextConfig: NextConfig = {
  // Keep production verification separate from a running development server.
  distDir: process.env.PORTFOLIO_BUILD_DIR ?? '.next',
  agentRules: false,
  reactCompiler: true,
  pageExtensions: ['ts', 'tsx', 'mdx'],
}

export default withMDX(nextConfig)
