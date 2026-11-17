import { accentFor, hueOf, type Requirement } from './brand'
import { CONTEXTS, DEFAULT_SELECTION, tokenGraph } from './graph'

// A rebrand, applied to this site's tokens: the color rule in ./brand.ts, asked
// to hold what the site's own tokens say an accent has to hold. The surfaces,
// the label, and the tokens to rewrite are all read from the graph the build checked.

const SURFACES = ['semantic.color.surface.canvas', 'semantic.color.surface.base', 'semantic.color.surface.raised']
const LABEL = 'semantic.color.ink.onAccent'
const FILL = 'semantic.color.accent.primary'
/** What each accent token is for. A fill carries a label and is seen as a mark. Text is read. */
const ROLES = { [FILL]: 'fill', 'semantic.color.accent.text': 'text' } as const

/** WCAG AA for text, and for the marks and edges of a control. */
const TEXT_FLOOR = 4.5
const MARK_FLOOR = 3

const at = (theme: string) => ({ ...DEFAULT_SELECTION, theme })
const hexAt = (path: string, theme: string) => tokenGraph().chain(path, at(theme))!.value.text

/** The base token a meaning token resolves to in a theme. */
function baseOf(path: string, theme: string) {
  const steps = tokenGraph().chain(path, at(theme))!.steps
  return steps[steps.length - 1].path
}

function requirementsFor(role: 'fill' | 'text', theme: string): Requirement[] {
  const surfaces = SURFACES.map((path) => hexAt(path, theme))
  if (role === 'text') return surfaces.map((against) => ({ against, floor: TEXT_FLOOR }))
  return [{ against: hexAt(LABEL, theme), floor: TEXT_FLOOR }, ...surfaces.map((against) => ({ against, floor: MARK_FLOOR }))]
}

/** Every base token the accent resolves to, with all its color has to hold in the themes that use it. */
let builtPlan: Map<string, Requirement[]> | undefined
function plan(): Map<string, Requirement[]> {
  if (builtPlan) return builtPlan
  const held = new Map<string, Requirement[]>()
  for (const theme of CONTEXTS.theme.options) {
    for (const [path, role] of Object.entries(ROLES)) {
      const base = baseOf(path, theme)
      held.set(base, [...(held.get(base) ?? []), ...requirementsFor(role, theme)])
    }
  }
  builtPlan = held
  return builtPlan
}

/** The hue the site ships with. Choosing it again is the same as resetting. */
export const DEFAULT_HUE = Math.round(hueOf(hexAt(FILL, CONTEXTS.theme.default)))

/** The highest hue a control offers. 360 would be 0 again. */
export const MAX_HUE = 359

export interface BrandReport {
  hue: number
  /** The accent's fill at this hue, in the theme asked about. */
  hex: string
}

/** What a hue would be on this site in one theme. The default hue reports the color as built. */
export function brandReport(hue: number, theme: string): BrandReport {
  if (hue === DEFAULT_HUE) return { hue, hex: hexAt(FILL, theme) }
  return { hue, hex: accentFor(hue, plan().get(baseOf(FILL, theme))!).hex }
}

/** New literal values at a hue for every base token the accent resolves to, as DTCG colors. */
export function rebrandLiterals(hue: number): Record<string, { colorSpace: 'srgb'; components: number[]; hex: string }> {
  return Object.fromEntries(
    [...plan()].map(([path, requirements]) => {
      const { components, hex } = accentFor(hue, requirements)
      return [path, { colorSpace: 'srgb' as const, components, hex }]
    }),
  )
}

/** The report and applied literals share one solve, so they cannot disagree. */
export function rebrand(hue: number, theme: string) {
  if (hue === DEFAULT_HUE) return { literals: null, report: brandReport(hue, theme) }
  const literals = rebrandLiterals(hue)
  return { literals, report: { hue, hex: literals[baseOf(FILL, theme)].hex } }
}
