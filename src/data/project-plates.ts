/**
 * The one screenshot that stands for a project. The homepage and the Work index show it as a plate, and the
 * case study opens on it, so following a project carries the same picture from the list to the top of its page.
 */
export interface ProjectPlate {
  src: string
  alt: string
  caption: string
  sourceUrl: string
}

const PLATES: Readonly<Record<string, ProjectPlate>> = {
  primitree: {
    src: '/images/primitree-playground-tokens.jpg',
    alt: 'Primitree Playground showing sample token colors, light and dark context controls, and a summary of 12 tokens and 12 generated files.',
    caption: 'The built-in variables sample resolves in the browser. Switch contexts to inspect the tokens and generated output.',
    sourceUrl: 'https://primitree.com/playground',
  },
  skydio: {
    src: '/images/skydio-orbit-story.jpg',
    alt: 'Skydio Autonomy Widget Orbit Mode story in Storybook, showing Orbiting status, a circular timer at 1:57, a red Pause control, and the orbit progress control.',
    caption: 'Orbit Mode in the public Storybook. The small marker is the fixed orbit reference, and the carets move the progress indicator in 5% steps.',
    sourceUrl: 'https://skydio-autonomy-widget.vercel.app/?path=/story/components-autonomywidget--orbit-mode',
  },
  'a11y-companion': {
    src: '/images/a11y-audit-browser-demo.jpg',
    alt: 'a11y Companion browser demo showing token contrast totals, representative-example counts, and affected uses beside Canvas Record.',
    caption: 'Token audit and Canvas Record in the browser demo on the product site. Full counts stay visible when the list shows only representative findings.',
    sourceUrl: 'https://marklearst.me/a11y-companion-widget/',
  },
  glucoseiq: {
    src: '/images/glucoseiq-report-trace.jpg',
    alt: 'glucoseiq.dev report card showing a latest reading of 99 mg/dL, steady and in range, above a 24-hour glucose trace inside the 70 to 180 mg/dL target band.',
    caption: 'The homepage report comes from @glucoseiq/core, run during the docs build on a seeded 14-day synthetic fixture.',
    sourceUrl: 'https://glucoseiq.dev/',
  },
}

export function getProjectPlate(slug: string): ProjectPlate | undefined {
  return PLATES[slug]
}
