import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [['remark-gfm', {}]],
  },
})

const nextConfig: NextConfig = {
  agentRules: false,
  reactCompiler: true,
  pageExtensions: ['ts', 'tsx', 'mdx'],
}

export default withMDX(nextConfig)
