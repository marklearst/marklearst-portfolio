/**
 * @primitree/cli TypeScript output from the source variables.
 * Each modifier axis uses its default context.
 */

export type TokenPath =
  | "color.amber.300"
  | "color.amber.800"
  | "color.brand.300"
  | "color.brand.500"
  | "color.brand.700"
  | "color.cyan.300"
  | "color.cyan.700"
  | "color.edge.dark"
  | "color.edge.light"
  | "color.green.300"
  | "color.green.700"
  | "color.neutral.0"
  | "color.neutral.100"
  | "color.neutral.1000"
  | "color.neutral.150"
  | "color.neutral.200"
  | "color.neutral.300"
  | "color.neutral.400"
  | "color.neutral.50"
  | "color.neutral.600"
  | "color.neutral.700"
  | "color.neutral.800"
  | "color.neutral.825"
  | "color.neutral.875"
  | "color.neutral.900"
  | "color.neutral.925"
  | "color.red.300"
  | "color.red.700"
  | "component.button.accent.background"
  | "component.button.accent.text"
  | "component.button.motion"
  | "component.button.primary.background"
  | "component.button.primary.text"
  | "component.button.secondary.background"
  | "component.button.secondary.border"
  | "component.button.secondary.text"
  | "component.dock.background"
  | "component.dock.border"
  | "component.dock.inset"
  | "component.dock.motion"
  | "component.glucose.cursor"
  | "component.glucose.grid"
  | "component.glucose.high"
  | "component.glucose.inRange"
  | "component.glucose.low"
  | "component.glucose.pointOutline"
  | "component.glucose.trace"
  | "component.inspector.label.background"
  | "component.inspector.label.text"
  | "component.inspector.motion"
  | "component.inspector.outline"
  | "duration.base"
  | "duration.deliberate"
  | "duration.hop"
  | "duration.instant"
  | "duration.quarter.base"
  | "duration.quarter.hop"
  | "duration.quarter.quick"
  | "duration.quarter.slow"
  | "duration.quick"
  | "duration.slow"
  | "easing.inOut"
  | "easing.linear"
  | "easing.out"
  | "easing.overshoot"
  | "font.family.mono"
  | "font.family.sans"
  | "font.leading.100"
  | "font.leading.200"
  | "font.leading.300"
  | "font.leading.400"
  | "font.leading.500"
  | "font.leading.600"
  | "font.size.100"
  | "font.size.200"
  | "font.size.300"
  | "font.size.400"
  | "font.size.50"
  | "font.size.500"
  | "font.size.600"
  | "font.size.700"
  | "font.size.800"
  | "font.tracking.none"
  | "font.tracking.snug"
  | "font.tracking.tight"
  | "font.weight.medium"
  | "font.weight.regular"
  | "layer.dock"
  | "layer.header"
  | "layer.outline"
  | "radius.1"
  | "radius.2"
  | "radius.3"
  | "radius.4"
  | "radius.5"
  | "semantic.color.accent.primary"
  | "semantic.color.accent.text"
  | "semantic.color.border.image"
  | "semantic.color.border.subtle"
  | "semantic.color.data.trace"
  | "semantic.color.ink.muted"
  | "semantic.color.ink.onAccent"
  | "semantic.color.ink.primary"
  | "semantic.color.ink.secondary"
  | "semantic.color.status.fail"
  | "semantic.color.status.pass"
  | "semantic.color.status.warn"
  | "semantic.color.surface.base"
  | "semantic.color.surface.canvas"
  | "semantic.color.surface.raised"
  | "semantic.color.surface.underprint"
  | "semantic.duration.causal"
  | "semantic.duration.feedback"
  | "semantic.duration.handoff"
  | "semantic.duration.hover"
  | "semantic.duration.reveal"
  | "semantic.easing.enter"
  | "semantic.easing.linear"
  | "semantic.easing.move"
  | "semantic.easing.settle"
  | "semantic.font.body"
  | "semantic.font.code"
  | "semantic.spring.land"
  | "semantic.spring.letter.damping"
  | "semantic.spring.letter.stiffness"
  | "semantic.type.body.leading"
  | "semantic.type.body.size"
  | "semantic.type.body.tracking"
  | "semantic.type.caption.leading"
  | "semantic.type.caption.size"
  | "semantic.type.code.leading"
  | "semantic.type.code.size"
  | "semantic.type.display.leading"
  | "semantic.type.display.size"
  | "semantic.type.display.tracking"
  | "semantic.type.heading.leading"
  | "semantic.type.heading.size"
  | "semantic.type.heading.tracking"
  | "semantic.type.lead.leading"
  | "semantic.type.lead.size"
  | "semantic.type.specimen.leading"
  | "semantic.type.specimen.size"
  | "semantic.type.specimen.tracking"
  | "semantic.type.subheading.leading"
  | "semantic.type.subheading.size"
  | "semantic.type.title.leading"
  | "semantic.type.title.size"
  | "semantic.type.title.tracking"
  | "semantic.type.ui.leading"
  | "semantic.type.ui.size"
  | "space.1"
  | "space.10"
  | "space.12"
  | "space.16"
  | "space.2"
  | "space.3"
  | "space.4"
  | "space.5"
  | "space.6"
  | "space.8"
  | "spring.bounce.none"
  | "spring.bounce.soft"
  | "spring.letter.damping"
  | "spring.letter.stiffness"

/** CSS variable references for each token path. */
export const tokenVars = {
  ["color.amber.300"]: "var(--color-amber-300)",
  ["color.amber.800"]: "var(--color-amber-800)",
  ["color.brand.300"]: "var(--color-brand-300)",
  ["color.brand.500"]: "var(--color-brand-500)",
  ["color.brand.700"]: "var(--color-brand-700)",
  ["color.cyan.300"]: "var(--color-cyan-300)",
  ["color.cyan.700"]: "var(--color-cyan-700)",
  ["color.edge.dark"]: "var(--color-edge-dark)",
  ["color.edge.light"]: "var(--color-edge-light)",
  ["color.green.300"]: "var(--color-green-300)",
  ["color.green.700"]: "var(--color-green-700)",
  ["color.neutral.0"]: "var(--color-neutral-0)",
  ["color.neutral.100"]: "var(--color-neutral-100)",
  ["color.neutral.1000"]: "var(--color-neutral-1000)",
  ["color.neutral.150"]: "var(--color-neutral-150)",
  ["color.neutral.200"]: "var(--color-neutral-200)",
  ["color.neutral.300"]: "var(--color-neutral-300)",
  ["color.neutral.400"]: "var(--color-neutral-400)",
  ["color.neutral.50"]: "var(--color-neutral-50)",
  ["color.neutral.600"]: "var(--color-neutral-600)",
  ["color.neutral.700"]: "var(--color-neutral-700)",
  ["color.neutral.800"]: "var(--color-neutral-800)",
  ["color.neutral.825"]: "var(--color-neutral-825)",
  ["color.neutral.875"]: "var(--color-neutral-875)",
  ["color.neutral.900"]: "var(--color-neutral-900)",
  ["color.neutral.925"]: "var(--color-neutral-925)",
  ["color.red.300"]: "var(--color-red-300)",
  ["color.red.700"]: "var(--color-red-700)",
  ["component.button.accent.background"]: "var(--component-button-accent-background)",
  ["component.button.accent.text"]: "var(--component-button-accent-text)",
  ["component.button.motion"]: "var(--component-button-motion)",
  ["component.button.primary.background"]: "var(--component-button-primary-background)",
  ["component.button.primary.text"]: "var(--component-button-primary-text)",
  ["component.button.secondary.background"]: "var(--component-button-secondary-background)",
  ["component.button.secondary.border"]: "var(--component-button-secondary-border)",
  ["component.button.secondary.text"]: "var(--component-button-secondary-text)",
  ["component.dock.background"]: "var(--component-dock-background)",
  ["component.dock.border"]: "var(--component-dock-border)",
  ["component.dock.inset"]: "var(--component-dock-inset)",
  ["component.dock.motion"]: "var(--component-dock-motion)",
  ["component.glucose.cursor"]: "var(--component-glucose-cursor)",
  ["component.glucose.grid"]: "var(--component-glucose-grid)",
  ["component.glucose.high"]: "var(--component-glucose-high)",
  ["component.glucose.inRange"]: "var(--component-glucose-inRange)",
  ["component.glucose.low"]: "var(--component-glucose-low)",
  ["component.glucose.pointOutline"]: "var(--component-glucose-pointOutline)",
  ["component.glucose.trace"]: "var(--component-glucose-trace)",
  ["component.inspector.label.background"]: "var(--component-inspector-label-background)",
  ["component.inspector.label.text"]: "var(--component-inspector-label-text)",
  ["component.inspector.motion"]: "var(--component-inspector-motion)",
  ["component.inspector.outline"]: "var(--component-inspector-outline)",
  ["duration.base"]: "var(--duration-base)",
  ["duration.deliberate"]: "var(--duration-deliberate)",
  ["duration.hop"]: "var(--duration-hop)",
  ["duration.instant"]: "var(--duration-instant)",
  ["duration.quarter.base"]: "var(--duration-quarter-base)",
  ["duration.quarter.hop"]: "var(--duration-quarter-hop)",
  ["duration.quarter.quick"]: "var(--duration-quarter-quick)",
  ["duration.quarter.slow"]: "var(--duration-quarter-slow)",
  ["duration.quick"]: "var(--duration-quick)",
  ["duration.slow"]: "var(--duration-slow)",
  ["easing.inOut"]: "var(--easing-inOut)",
  ["easing.linear"]: "var(--easing-linear)",
  ["easing.out"]: "var(--easing-out)",
  ["easing.overshoot"]: "var(--easing-overshoot)",
  ["font.family.mono"]: "var(--font-family-mono)",
  ["font.family.sans"]: "var(--font-family-sans)",
  ["font.leading.100"]: "var(--font-leading-100)",
  ["font.leading.200"]: "var(--font-leading-200)",
  ["font.leading.300"]: "var(--font-leading-300)",
  ["font.leading.400"]: "var(--font-leading-400)",
  ["font.leading.500"]: "var(--font-leading-500)",
  ["font.leading.600"]: "var(--font-leading-600)",
  ["font.size.100"]: "var(--font-size-100)",
  ["font.size.200"]: "var(--font-size-200)",
  ["font.size.300"]: "var(--font-size-300)",
  ["font.size.400"]: "var(--font-size-400)",
  ["font.size.50"]: "var(--font-size-50)",
  ["font.size.500"]: "var(--font-size-500)",
  ["font.size.600"]: "var(--font-size-600)",
  ["font.size.700"]: "var(--font-size-700)",
  ["font.size.800"]: "var(--font-size-800)",
  ["font.tracking.none"]: "var(--font-tracking-none)",
  ["font.tracking.snug"]: "var(--font-tracking-snug)",
  ["font.tracking.tight"]: "var(--font-tracking-tight)",
  ["font.weight.medium"]: "var(--font-weight-medium)",
  ["font.weight.regular"]: "var(--font-weight-regular)",
  ["layer.dock"]: "var(--layer-dock)",
  ["layer.header"]: "var(--layer-header)",
  ["layer.outline"]: "var(--layer-outline)",
  ["radius.1"]: "var(--radius-1)",
  ["radius.2"]: "var(--radius-2)",
  ["radius.3"]: "var(--radius-3)",
  ["radius.4"]: "var(--radius-4)",
  ["radius.5"]: "var(--radius-5)",
  ["semantic.color.accent.primary"]: "var(--semantic-color-accent-primary)",
  ["semantic.color.accent.text"]: "var(--semantic-color-accent-text)",
  ["semantic.color.border.image"]: "var(--semantic-color-border-image)",
  ["semantic.color.border.subtle"]: "var(--semantic-color-border-subtle)",
  ["semantic.color.data.trace"]: "var(--semantic-color-data-trace)",
  ["semantic.color.ink.muted"]: "var(--semantic-color-ink-muted)",
  ["semantic.color.ink.onAccent"]: "var(--semantic-color-ink-onAccent)",
  ["semantic.color.ink.primary"]: "var(--semantic-color-ink-primary)",
  ["semantic.color.ink.secondary"]: "var(--semantic-color-ink-secondary)",
  ["semantic.color.status.fail"]: "var(--semantic-color-status-fail)",
  ["semantic.color.status.pass"]: "var(--semantic-color-status-pass)",
  ["semantic.color.status.warn"]: "var(--semantic-color-status-warn)",
  ["semantic.color.surface.base"]: "var(--semantic-color-surface-base)",
  ["semantic.color.surface.canvas"]: "var(--semantic-color-surface-canvas)",
  ["semantic.color.surface.raised"]: "var(--semantic-color-surface-raised)",
  ["semantic.color.surface.underprint"]: "var(--semantic-color-surface-underprint)",
  ["semantic.duration.causal"]: "var(--semantic-duration-causal)",
  ["semantic.duration.feedback"]: "var(--semantic-duration-feedback)",
  ["semantic.duration.handoff"]: "var(--semantic-duration-handoff)",
  ["semantic.duration.hover"]: "var(--semantic-duration-hover)",
  ["semantic.duration.reveal"]: "var(--semantic-duration-reveal)",
  ["semantic.easing.enter"]: "var(--semantic-easing-enter)",
  ["semantic.easing.linear"]: "var(--semantic-easing-linear)",
  ["semantic.easing.move"]: "var(--semantic-easing-move)",
  ["semantic.easing.settle"]: "var(--semantic-easing-settle)",
  ["semantic.font.body"]: "var(--semantic-font-body)",
  ["semantic.font.code"]: "var(--semantic-font-code)",
  ["semantic.spring.land"]: "var(--semantic-spring-land)",
  ["semantic.spring.letter.damping"]: "var(--semantic-spring-letter-damping)",
  ["semantic.spring.letter.stiffness"]: "var(--semantic-spring-letter-stiffness)",
  ["semantic.type.body.leading"]: "var(--semantic-type-body-leading)",
  ["semantic.type.body.size"]: "var(--semantic-type-body-size)",
  ["semantic.type.body.tracking"]: "var(--semantic-type-body-tracking)",
  ["semantic.type.caption.leading"]: "var(--semantic-type-caption-leading)",
  ["semantic.type.caption.size"]: "var(--semantic-type-caption-size)",
  ["semantic.type.code.leading"]: "var(--semantic-type-code-leading)",
  ["semantic.type.code.size"]: "var(--semantic-type-code-size)",
  ["semantic.type.display.leading"]: "var(--semantic-type-display-leading)",
  ["semantic.type.display.size"]: "var(--semantic-type-display-size)",
  ["semantic.type.display.tracking"]: "var(--semantic-type-display-tracking)",
  ["semantic.type.heading.leading"]: "var(--semantic-type-heading-leading)",
  ["semantic.type.heading.size"]: "var(--semantic-type-heading-size)",
  ["semantic.type.heading.tracking"]: "var(--semantic-type-heading-tracking)",
  ["semantic.type.lead.leading"]: "var(--semantic-type-lead-leading)",
  ["semantic.type.lead.size"]: "var(--semantic-type-lead-size)",
  ["semantic.type.specimen.leading"]: "var(--semantic-type-specimen-leading)",
  ["semantic.type.specimen.size"]: "var(--semantic-type-specimen-size)",
  ["semantic.type.specimen.tracking"]: "var(--semantic-type-specimen-tracking)",
  ["semantic.type.subheading.leading"]: "var(--semantic-type-subheading-leading)",
  ["semantic.type.subheading.size"]: "var(--semantic-type-subheading-size)",
  ["semantic.type.title.leading"]: "var(--semantic-type-title-leading)",
  ["semantic.type.title.size"]: "var(--semantic-type-title-size)",
  ["semantic.type.title.tracking"]: "var(--semantic-type-title-tracking)",
  ["semantic.type.ui.leading"]: "var(--semantic-type-ui-leading)",
  ["semantic.type.ui.size"]: "var(--semantic-type-ui-size)",
  ["space.1"]: "var(--space-1)",
  ["space.10"]: "var(--space-10)",
  ["space.12"]: "var(--space-12)",
  ["space.16"]: "var(--space-16)",
  ["space.2"]: "var(--space-2)",
  ["space.3"]: "var(--space-3)",
  ["space.4"]: "var(--space-4)",
  ["space.5"]: "var(--space-5)",
  ["space.6"]: "var(--space-6)",
  ["space.8"]: "var(--space-8)",
  ["spring.bounce.none"]: "var(--spring-bounce-none)",
  ["spring.bounce.soft"]: "var(--spring-bounce-soft)",
  ["spring.letter.damping"]: "var(--spring-letter-damping)",
  ["spring.letter.stiffness"]: "var(--spring-letter-stiffness)",
} as const satisfies Record<TokenPath, string>

/** Values resolved for the default contexts. */
export const tokenValues = {
  ["color.amber.300"]: "color(srgb 0.898 0.7412 0.3922)",
  ["color.amber.800"]: "color(srgb 0.4627 0.3176 0.0353)",
  ["color.brand.300"]: "color(srgb 1 0.2745 0.3176)",
  ["color.brand.500"]: "color(srgb 0.8588 0.0941 0.2039)",
  ["color.brand.700"]: "color(srgb 0.8353 0.0392 0.1843)",
  ["color.cyan.300"]: "color(srgb 0.4706 0.8627 0.9098)",
  ["color.cyan.700"]: "color(srgb 0.0314 0.4941 0.5451)",
  ["color.edge.dark"]: "color(srgb 0 0 0 / 0.1)",
  ["color.edge.light"]: "color(srgb 1 1 1 / 0.1)",
  ["color.green.300"]: "color(srgb 0.5725 0.7333 0.5412)",
  ["color.green.700"]: "color(srgb 0.2353 0.4235 0.2039)",
  ["color.neutral.0"]: "color(srgb 1 1 1)",
  ["color.neutral.100"]: "color(srgb 0.9569 0.9569 0.949)",
  ["color.neutral.1000"]: "color(srgb 0 0 0)",
  ["color.neutral.150"]: "color(srgb 0.9255 0.9255 0.902)",
  ["color.neutral.200"]: "color(srgb 0.8902 0.8902 0.8745)",
  ["color.neutral.300"]: "color(srgb 0.8196 0.8196 0.7843)",
  ["color.neutral.400"]: "color(srgb 0.6667 0.6667 0.6431)",
  ["color.neutral.50"]: "color(srgb 0.9686 0.9686 0.9529)",
  ["color.neutral.600"]: "color(srgb 0.3843 0.3843 0.3569)",
  ["color.neutral.700"]: "color(srgb 0.2784 0.2784 0.2627)",
  ["color.neutral.800"]: "color(srgb 0.2039 0.2039 0.1961)",
  ["color.neutral.825"]: "color(srgb 0.149 0.149 0.149)",
  ["color.neutral.875"]: "color(srgb 0.102 0.102 0.102)",
  ["color.neutral.900"]: "color(srgb 0.0784 0.0784 0.0784)",
  ["color.neutral.925"]: "color(srgb 0.0667 0.0667 0.0627)",
  ["color.red.300"]: "color(srgb 0.9333 0.5412 0.502)",
  ["color.red.700"]: "color(srgb 0.6784 0.2235 0.1922)",
  ["component.button.accent.background"]: "color(srgb 0.8588 0.0941 0.2039)",
  ["component.button.accent.text"]: "color(srgb 0.9569 0.9569 0.949)",
  ["component.button.motion"]: "360ms",
  ["component.button.primary.background"]: "color(srgb 0.9569 0.9569 0.949)",
  ["component.button.primary.text"]: "color(srgb 0.0784 0.0784 0.0784)",
  ["component.button.secondary.background"]: "color(srgb 0.102 0.102 0.102)",
  ["component.button.secondary.border"]: "color(srgb 0.2039 0.2039 0.1961)",
  ["component.button.secondary.text"]: "color(srgb 0.9569 0.9569 0.949)",
  ["component.dock.background"]: "color(srgb 0.149 0.149 0.149)",
  ["component.dock.border"]: "color(srgb 0.2039 0.2039 0.1961)",
  ["component.dock.inset"]: "color(srgb 0.102 0.102 0.102)",
  ["component.dock.motion"]: "280ms",
  ["component.glucose.cursor"]: "color(srgb 0.9569 0.9569 0.949)",
  ["component.glucose.grid"]: "color(srgb 0.2039 0.2039 0.1961)",
  ["component.glucose.high"]: "color(srgb 0.898 0.7412 0.3922)",
  ["component.glucose.inRange"]: "color(srgb 0.5725 0.7333 0.5412)",
  ["component.glucose.low"]: "color(srgb 0.9333 0.5412 0.502)",
  ["component.glucose.pointOutline"]: "color(srgb 0.102 0.102 0.102)",
  ["component.glucose.trace"]: "color(srgb 0.4706 0.8627 0.9098)",
  ["component.inspector.label.background"]: "color(srgb 0.8588 0.0941 0.2039)",
  ["component.inspector.label.text"]: "color(srgb 0.9569 0.9569 0.949)",
  ["component.inspector.motion"]: "180ms",
  ["component.inspector.outline"]: "color(srgb 0.8588 0.0941 0.2039)",
  ["duration.base"]: "180ms",
  ["duration.deliberate"]: "360ms",
  ["duration.hop"]: "60ms",
  ["duration.instant"]: "0ms",
  ["duration.quarter.base"]: "720ms",
  ["duration.quarter.hop"]: "240ms",
  ["duration.quarter.quick"]: "560ms",
  ["duration.quarter.slow"]: "1120ms",
  ["duration.quick"]: "140ms",
  ["duration.slow"]: "280ms",
  ["easing.inOut"]: [0.645,0.045,0.355,1],
  ["easing.linear"]: [0,0,1,1],
  ["easing.out"]: [0.22,1,0.36,1],
  ["easing.overshoot"]: [0.34,1.3,0.64,1],
  ["font.family.mono"]: ["MonoLisa","MonoLisa fallback","SF Mono","Consolas","monospace"],
  ["font.family.sans"]: ["Wotfard","Wotfard fallback","Arial","sans-serif"],
  ["font.leading.100"]: "1.05",
  ["font.leading.200"]: "1.15",
  ["font.leading.300"]: "1.25",
  ["font.leading.400"]: "1.35",
  ["font.leading.500"]: "1.5",
  ["font.leading.600"]: "1.6",
  ["font.size.100"]: "0.875rem",
  ["font.size.200"]: "1rem",
  ["font.size.300"]: "1.25rem",
  ["font.size.400"]: "1.5rem",
  ["font.size.50"]: "0.8125rem",
  ["font.size.500"]: "2.5rem",
  ["font.size.600"]: "3.5rem",
  ["font.size.700"]: "5.5rem",
  ["font.size.800"]: "11rem",
  ["font.tracking.none"]: "0",
  ["font.tracking.snug"]: "-0.01",
  ["font.tracking.tight"]: "-0.015",
  ["font.weight.medium"]: "500",
  ["font.weight.regular"]: "400",
  ["layer.dock"]: "30",
  ["layer.header"]: "40",
  ["layer.outline"]: "20",
  ["radius.1"]: "4px",
  ["radius.2"]: "6px",
  ["radius.3"]: "8px",
  ["radius.4"]: "12px",
  ["radius.5"]: "16px",
  ["semantic.color.accent.primary"]: "color(srgb 0.8588 0.0941 0.2039)",
  ["semantic.color.accent.text"]: "color(srgb 1 0.2745 0.3176)",
  ["semantic.color.border.image"]: "color(srgb 1 1 1 / 0.1)",
  ["semantic.color.border.subtle"]: "color(srgb 0.2039 0.2039 0.1961)",
  ["semantic.color.data.trace"]: "color(srgb 0.4706 0.8627 0.9098)",
  ["semantic.color.ink.muted"]: "color(srgb 0.6667 0.6667 0.6431)",
  ["semantic.color.ink.onAccent"]: "color(srgb 0.9569 0.9569 0.949)",
  ["semantic.color.ink.primary"]: "color(srgb 0.9569 0.9569 0.949)",
  ["semantic.color.ink.secondary"]: "color(srgb 0.8902 0.8902 0.8745)",
  ["semantic.color.status.fail"]: "color(srgb 0.9333 0.5412 0.502)",
  ["semantic.color.status.pass"]: "color(srgb 0.5725 0.7333 0.5412)",
  ["semantic.color.status.warn"]: "color(srgb 0.898 0.7412 0.3922)",
  ["semantic.color.surface.base"]: "color(srgb 0.102 0.102 0.102)",
  ["semantic.color.surface.canvas"]: "color(srgb 0.0784 0.0784 0.0784)",
  ["semantic.color.surface.raised"]: "color(srgb 0.149 0.149 0.149)",
  ["semantic.color.surface.underprint"]: "color(srgb 0 0 0)",
  ["semantic.duration.causal"]: "60ms",
  ["semantic.duration.feedback"]: "140ms",
  ["semantic.duration.handoff"]: "280ms",
  ["semantic.duration.hover"]: "360ms",
  ["semantic.duration.reveal"]: "180ms",
  ["semantic.easing.enter"]: [0.22,1,0.36,1],
  ["semantic.easing.linear"]: [0,0,1,1],
  ["semantic.easing.move"]: [0.645,0.045,0.355,1],
  ["semantic.easing.settle"]: [0.34,1.3,0.64,1],
  ["semantic.font.body"]: ["Wotfard","Wotfard fallback","Arial","sans-serif"],
  ["semantic.font.code"]: ["MonoLisa","MonoLisa fallback","SF Mono","Consolas","monospace"],
  ["semantic.spring.land"]: "0.2",
  ["semantic.spring.letter.damping"]: "30",
  ["semantic.spring.letter.stiffness"]: "250",
  ["semantic.type.body.leading"]: "1.5",
  ["semantic.type.body.size"]: "1.25rem",
  ["semantic.type.body.tracking"]: "0",
  ["semantic.type.caption.leading"]: "1.5",
  ["semantic.type.caption.size"]: "0.875rem",
  ["semantic.type.code.leading"]: "1.6",
  ["semantic.type.code.size"]: "0.8125rem",
  ["semantic.type.display.leading"]: "1.05",
  ["semantic.type.display.size"]: "5.5rem",
  ["semantic.type.display.tracking"]: "-0.015",
  ["semantic.type.heading.leading"]: "1.25",
  ["semantic.type.heading.size"]: "2.5rem",
  ["semantic.type.heading.tracking"]: "-0.01",
  ["semantic.type.lead.leading"]: "1.5",
  ["semantic.type.lead.size"]: "1.25rem",
  ["semantic.type.specimen.leading"]: "1.05",
  ["semantic.type.specimen.size"]: "11rem",
  ["semantic.type.specimen.tracking"]: "-0.015",
  ["semantic.type.subheading.leading"]: "1.35",
  ["semantic.type.subheading.size"]: "1.5rem",
  ["semantic.type.title.leading"]: "1.15",
  ["semantic.type.title.size"]: "3.5rem",
  ["semantic.type.title.tracking"]: "-0.015",
  ["semantic.type.ui.leading"]: "1.5",
  ["semantic.type.ui.size"]: "1rem",
  ["space.1"]: "4px",
  ["space.10"]: "40px",
  ["space.12"]: "48px",
  ["space.16"]: "64px",
  ["space.2"]: "8px",
  ["space.3"]: "12px",
  ["space.4"]: "16px",
  ["space.5"]: "20px",
  ["space.6"]: "24px",
  ["space.8"]: "32px",
  ["spring.bounce.none"]: "0",
  ["spring.bounce.soft"]: "0.2",
  ["spring.letter.damping"]: "30",
  ["spring.letter.stiffness"]: "250",
} as const
