import { BUILD_CHECK, CONTEXTS, PRIMITREE_VERSION } from '@/lib/inspector/graph'

export const dynamic = 'force-static'

const contexts = Object.entries(CONTEXTS)
  .map(([axis, { options }]) => `${axis} (${options.join(', ')})`)
  .join(' and ')

const body = `# Mark Learst

Design engineer and UI architect who sets system direction in code. Portfolio at https://marklearst.com.

## The site is a running design system

Its motion comes entirely from one token graph, and its color and type mostly do. Values that are still raw are counted by a ratchet that only goes down, and the inspector reports them as raw. Primitree ${PRIMITREE_VERSION} builds that graph and checks it against layer rules on every deploy. This deploy: ${BUILD_CHECK.tokens} tokens, ${BUILD_CHECK.layers} layers, ${BUILD_CHECK.findings.length} findings, exit ${BUILD_CHECK.exit}.

- /tokens.json: the tokens as one DTCG 2025.10 document, in the default context
- /graph.json: every token with its value in each context, the layer policy, the CSS variable names, and the check result

Layers: base holds literal values, meaning holds references to base, component holds references to meaning. Contexts reroute the meaning layer: ${contexts}.

To trace a value, find the token in /graph.json under fragment.tokens and follow each value.target until a literal. On the site, the Inspect control in the header does the same for any element on any page.

## Pages

- /work: case studies
- /system: live token graph and motion examples from the portfolio
- /work/primitree: the token tool that builds this site
- /work/a11y-companion: accessibility review on the Figma canvas
- /work/glucoseiq: glucose data layer
- /artifacts: writing
- /about: experience and contact

## Source

- https://github.com/marklearst/marklearst-portfolio
- https://github.com/marklearst/primitree
`

export function GET() {
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
