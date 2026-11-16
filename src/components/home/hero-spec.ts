// What the blueprint writes on each part of the introduction: the token group
// that part's styles read, by its real path. hero-spec.test.mjs derives the
// custom properties that path stands for and fails if the rule named here
// stops reading them. `above` is the spacing token over the part and `between`
// the one between its paragraphs, which the same rule declares by value and by name.

export interface PartSpec {
  /** The class that styles this part, in Hero.module.css unless `sheet` names another stylesheet. */
  rule: string
  sheet?: string
  /** The token group the part reads, as a path a visitor could look up. */
  label?: string
  above?: string
  between?: string
}

export const HERO_SPEC = {
  name: { rule: 'name', label: 'semantic.type.display' },
  lead: { rule: 'lead', label: 'semantic.type.subheading', above: 'space.6' },
  support: { rule: 'support', label: 'semantic.type.body', above: 'space.6', between: 'space.4' },
  actions: { rule: 'actions', above: 'space.8' },
  explore: { rule: "button[data-variant='primary']", sheet: 'src/components/ui/Button.module.css', label: 'component.button.primary' },
  available: { rule: 'available', label: 'semantic.type.caption', above: 'space.6' },
} as const satisfies Record<string, PartSpec>
