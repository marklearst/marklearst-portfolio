/** Which context each Resolver axis is in, for example `{ theme: 'dark', motion: 'default' }`. */
export type ContextSelection = Readonly<Record<string, string>>

export interface Finding {
  ruleId: string
  path: string
  message: string
  layerId?: string
}

export interface CheckSummary {
  /** The command this result stands for. */
  command: string
  tokens: number
  layers: number
  contexts: number
  findings: readonly Finding[]
  exit: 0 | 1
}

/** One token on the way from an element to a raw value. */
export interface ChainStep {
  path: string
  /** The policy layer that owns the token's root. */
  layer: string
  /** Set when a context supplied this token's value, for example `light`. */
  context: string | null
  finding: Finding | null
}

export type ValueKind = 'color' | 'duration' | 'easing' | 'dimension' | 'number' | 'font' | 'text'

export interface ChainValue {
  kind: ValueKind
  /** What a person reads: `#F4F4F2`, `140ms`, `1.25rem`. */
  text: string
  /** A CSS value the browser can paint or run, when `text` is not one. */
  css: string
  /** True when a layer that requires references holds this value itself. */
  literal: boolean
}

export interface Contrast {
  ratio: number
  /** The WCAG AA floor that applies to this text: 4.5, or 3 for large text. */
  floor: number
}

export interface ResolvedChain {
  steps: readonly ChainStep[]
  value: ChainValue
}

/** One painted property of an element and where its value comes from. */
export interface PropertyReport {
  id: string
  label: string
  /** Empty when the property holds a raw value. */
  chains: readonly ResolvedChain[]
  /** The declared CSS when it is more than a single token reference. */
  expression: string | null
  /** The computed value of a property no token reaches. */
  raw: string | null
  contrast: Contrast | null
}

export interface Inspection {
  label: string
  /** The stylesheet and class that style the element, when known. */
  source: string | null
  properties: readonly PropertyReport[]
}
