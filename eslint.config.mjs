import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    '.vercel/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Saved research and third-party examples are not application source.
    'docs/**',
    '.firecrawl/**',
  ]),
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app/**'],
          message: 'Routes compose features. Put shared presentation in the owning component folder instead of importing a route.',
        }],
      }],
    },
  },
  {
    files: ['src/lib/**/*.{ts,tsx}', 'src/data/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app/**', '@/components/**', '@/hooks/**'],
          message: 'Data and library modules must not depend on UI. Resolve presentation in the consuming feature.',
        }],
      }],
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app/**', '@/data/**', '@/lib/content/**'],
          message: 'UI primitives must remain independent of route and portfolio content.',
        }],
      }],
    },
  },
])

export default eslintConfig
