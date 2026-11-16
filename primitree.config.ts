import { defineConfig } from '@primitree/cli/config'

// The site's token rules. `primitree check` reads this file, and so does
// scripts/tokens/build.mjs, which applies the same layers to every context.
//
// The CLI's config form reads one DTCG document, so the build writes the
// Resolver's default context (dark theme, default motion) to the file below
// before the check runs. The authored sources live in src/tokens.
export default defineConfig({
  schemaVersion: 1,
  sources: {
    site: {
      type: 'dtcg',
      file: './src/tokens/generated/site.tokens.json',
      architecture: {
        layers: [
          {
            id: 'base',
            roots: ['color', 'font', 'space', 'radius', 'layer', 'duration', 'easing', 'spring'],
            values: 'literal',
          },
          {
            id: 'meaning',
            roots: ['semantic'],
            values: 'reference',
            references: ['base'],
          },
          {
            id: 'component',
            roots: ['component'],
            values: 'reference',
            references: ['meaning'],
          },
        ],
      },
      ownership: { default: ['marklearst'] },
    },
  },
})
