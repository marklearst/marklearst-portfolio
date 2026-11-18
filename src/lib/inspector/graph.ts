import { composeGraph, createGraphFragment, createSourceView, resolveView } from '@primitree/core'
import type { GraphSnapshot, ResolvedToken } from '@primitree/core'
import { createPolicy, evaluatePolicy } from '@primitree/core/policy'
import type { Policy } from '@primitree/core/policy'
import build from '@/tokens/generated/graph.json'
import type {
  ChainStep,
  ChainValue,
  CheckSummary,
  ContextSelection,
  Finding,
  ResolvedChain,
  ValueKind,
} from './types'

// The build output of scripts/tokens/build.mjs: Primitree's graph for every
// context, the policy from primitree.config.ts, and the site's CSS names.
type AuthoredValue = {
  value: { kind: 'literal'; value: unknown } | { kind: 'reference'; target: string }
  conditions: Record<string, string>
  priority: number
  provenance: { uri?: string; pointer?: string }[]
}
type FragmentToken = { id: string; path: string[]; type: string; values: AuthoredValue[] }
type Fragment = { source: unknown; groups: unknown[]; tokens: FragmentToken[] }
type Alias = { token: string; css?: string }

const data = build as unknown as {
  primitree: string
  policy: { id: string; viewId: string; layers: { id: string; roots: string[] }[] }
  contexts: Record<string, { default: string; options: string[] }>
  cssVars: Record<string, string>
  aliases: Record<string, Alias>
  check: CheckSummary
  fragment: Fragment
}

/** The rule Break a rule breaks: this meaning token holds a literal instead of a reference. */
export const BREAK_PATH = 'semantic.color.accent.primary'

export const PRIMITREE_VERSION = data.primitree
export const CONTEXTS = data.contexts
export const DEFAULT_SELECTION: ContextSelection = Object.fromEntries(
  Object.entries(data.contexts).map(([axis, context]) => [axis, context.default]),
)
/** The check that ran when the site was built. */
export const BUILD_CHECK: CheckSummary = data.check

const layerByRoot = new Map(data.policy.layers.flatMap((layer) => layer.roots.map((root) => [root, layer.id])))
const tokensByPath = new Map(data.fragment.tokens.map((token) => [token.path.join('.'), token]))
const pathById = new Map(data.fragment.tokens.map((token) => [token.id, token.path.join('.')]))
const tokenByVar = new Map<string, Alias>([
  ...Object.entries(data.cssVars).map(([path, name]): [string, Alias] => [name, { token: path }]),
  ...Object.entries(data.aliases),
])
const varsByToken = new Map<string, string[]>()
for (const [name, { token }] of tokenByVar) varsByToken.set(token, [...(varsByToken.get(token) ?? []), name])

export const hasToken = (path: string) => tokensByPath.has(path)
export const typeOf = (path: string) => tokensByPath.get(path)?.type ?? null
export const layerOf = (path: string) => layerByRoot.get(path.split('.')[0]) ?? 'unassigned'
/** The token a CSS custom property stands for, and the CSS wrapped around it when the name is an adapter. */
export const tokenForVar = (name: string) => tokenByVar.get(name) ?? null
/** Every CSS custom property that carries this token: Primitree's own name, then the site's adapter names. */
export const varsFor = (path: string): readonly string[] => varsByToken.get(path) ?? []
export const cssVar = (path: string) => data.cssVars[path] ?? null
export const TOKEN_PATHS = data.fragment.tokens.map((token) => token.path.join('.')).sort()

const selectionKey = (selection: ContextSelection) =>
  Object.keys(selection).sort().map((axis) => `${axis}=${selection[axis]}`).join('|')

function unwrap<Value>(result: { ok: true; value: Value } | { ok: false; diagnostics: readonly { message: string }[] }): Value {
  if (!result.ok) throw new Error(result.diagnostics[0]?.message ?? 'Primitree could not read the token graph.')
  return result.value
}

function snapshot(fragment: Fragment): GraphSnapshot {
  const graph = unwrap(composeGraph([unwrap(createGraphFragment(fragment))]))
  return { graph, view: unwrap(createSourceView(graph, { id: data.policy.viewId })) }
}

/** The value Primitree picks for a selection: most conditions matched, then highest priority. */
function winningValue(token: FragmentToken, selection: ContextSelection): AuthoredValue | undefined {
  return token.values
    .filter((authored) => Object.entries(authored.conditions).every(([axis, context]) => selection[axis] === context))
    .sort(
      (a, b) =>
        Object.keys(b.conditions).length - Object.keys(a.conditions).length || b.priority - a.priority,
    )[0]
}

const round = (value: number, places: number) => Number(value.toFixed(places))

function formatValue(type: string, raw: unknown, literal: boolean): ChainValue {
  const value = (kind: ValueKind, text: string, css = text): ChainValue => ({ kind, text, css, literal })
  if (type === 'color' && raw && typeof raw === 'object') {
    const color = raw as { colorSpace: string; components: (number | 'none')[]; alpha?: number; hex?: string }
    const css = `color(${color.colorSpace} ${color.components.join(' ')}${color.alpha === undefined ? '' : ` / ${color.alpha}`})`
    const hex = color.hex ?? css
    return value('color', color.alpha !== undefined && color.alpha < 1 ? `${hex} at ${round(color.alpha * 100, 1)}%` : hex, css)
  }
  if ((type === 'duration' || type === 'dimension') && raw && typeof raw === 'object') {
    const { value: amount, unit } = raw as { value: number; unit: string }
    return value(type, `${amount}${unit}`)
  }
  if (type === 'cubicBezier' && Array.isArray(raw)) return value('easing', `cubic-bezier(${raw.join(', ')})`)
  if (type === 'fontFamily') {
    const families = Array.isArray(raw) ? raw : [raw]
    return value('font', String(families[0]), families.map((name) => (/\s/.test(String(name)) ? `'${name}'` : name)).join(', '))
  }
  if (type === 'number') return value('number', String(raw))
  return value('text', typeof raw === 'string' ? raw : JSON.stringify(raw))
}

export interface TokenGraph {
  readonly broken: boolean
  /** The chain from a token to its raw value under a selection, or null when the path is not a token. */
  chain(path: string, selection: ContextSelection): ResolvedChain | null
  /** The raw value a token resolves to under a selection, as its base token stores it. */
  resolve(path: string, selection: ContextSelection): unknown
  /** Every token whose chain passes through `path` under a selection, itself included, nearest first. */
  dependents(path: string, selection: ContextSelection): readonly { path: string; hops: number }[]
  /** Primitree's policy, evaluated now, against this graph. */
  check(): CheckSummary
}

function createGraph(fragment: Fragment, broken: boolean): TokenGraph {
  const snap = snapshot(fragment)
  const tokens = new Map(fragment.tokens.map((token) => [token.path.join('.'), token]))
  const resolved = new Map<string, Map<string, ResolvedToken>>()
  let policy: Policy | undefined
  let report: CheckSummary | undefined

  function view(selection: ContextSelection) {
    const key = selectionKey(selection)
    let byPath = resolved.get(key)
    if (!byPath) {
      byPath = new Map(unwrap(resolveView(snap.graph, snap.view, selection)).map((token) => [token.path.join('.'), token]))
      resolved.set(key, byPath)
    }
    return byPath
  }

  function check(): CheckSummary {
    if (report) return report
    policy ??= unwrap(createPolicy(data.policy))
    const result = unwrap(evaluatePolicy(snap, policy))
    const findings: Finding[] = result.findings.map(({ ruleId, path, message, layerId }) => ({
      ruleId,
      path: path.join('.'),
      message,
      layerId,
    }))
    report = {
      command: data.check.command,
      tokens: snap.graph.tokens.length,
      layers: policy.layers.length,
      contexts: data.check.contexts,
      findings,
      exit: result.summary.active > 0 ? 1 : 0,
    }
    return report
  }

  return {
    broken,
    check,
    chain(path, selection) {
      const token = view(selection).get(path)
      if (!token) return null
      const findings = new Map(check().findings.map((finding) => [finding.path, finding]))
      const steps: ChainStep[] = token.referenceChain.map((id) => {
        const step = pathById.get(id) ?? id
        const conditions = winningValue(tokens.get(step)!, selection)?.conditions ?? {}
        return {
          path: step,
          layer: layerOf(step),
          context: Object.values(conditions).join(', ') || null,
          finding: findings.get(step) ?? null,
        }
      })
      const last = steps[steps.length - 1]
      // A literal is only worth naming where the layer forbids it.
      return { steps, value: formatValue(token.type, token.value, last.finding?.ruleId === 'PT1003') }
    },
    resolve: (path, selection) => view(selection).get(path)?.value,
    dependents(path, selection) {
      const id = tokens.get(path)?.id
      if (!id) return []
      const out: { path: string; hops: number }[] = []
      for (const [candidate, token] of view(selection)) {
        const hops = (token.referenceChain as readonly string[]).indexOf(id)
        if (hops >= 0) out.push({ path: candidate, hops })
      }
      return out.sort((a, b) => a.hops - b.hops)
    },
  }
}

/** A value BREAK_PATH held at the moment its rule was broken, for one of its authored conditions. */
export interface FrozenValue {
  conditions: Record<string, string>
  value: unknown
}

/** What a visitor has changed in the graph. The build's graph is the one with no edits. */
export interface GraphEdits {
  /** New literal values for base tokens, by path: a rebrand. */
  literals?: Readonly<Record<string, unknown>> | null
  /** Set while a rule is broken: BREAK_PATH holds these literals instead of its references. */
  frozen?: readonly FrozenValue[] | null
}

const graphs = new Map<string, TokenGraph>()

/** The site's token graph with a visitor's edits applied. */
export function editedGraph(edits: GraphEdits = {}): TokenGraph {
  const literals = edits.literals ?? null
  const frozen = edits.frozen ?? null
  const key = JSON.stringify([literals, frozen])
  let graph = graphs.get(key)
  if (!graph) {
    const fragment: Fragment = {
      ...data.fragment,
      tokens: data.fragment.tokens.map((token) => {
        const path = token.path.join('.')
        if (literals && path in literals) {
          return { ...token, values: token.values.map((authored) => ({ ...authored, value: { kind: 'literal' as const, value: literals[path] } })) }
        }
        if (frozen && path === BREAK_PATH) {
          return {
            ...token,
            values: token.values.map((authored) => {
              const held = frozen.find((entry) => selectionKey(entry.conditions) === selectionKey(authored.conditions))
              return held ? { ...authored, value: { kind: 'literal' as const, value: held.value } } : authored
            }),
          }
        }
        return token
      }),
    }
    // A visitor dragging through hues makes a graph per stop. Only the recent ones are worth keeping.
    if (graphs.size > 12) graphs.clear()
    graphs.set(key, (graph = createGraph(fragment, Boolean(frozen))))
  }
  return graph
}

/** The site's token graph, as built. */
export const tokenGraph = () => editedGraph()

/**
 * Breaks the rule: every value of BREAK_PATH becomes the literal it resolves
 * to right now. The resolved values, and so the colors, do not change. What
 * changes is that the token no longer follows what it used to reference. The
 * page shows that by letting what the token paints hang loose.
 */
export function freeze(graph: TokenGraph): FrozenValue[] {
  return tokensByPath.get(BREAK_PATH)!.values.map(({ conditions }) => ({
    conditions,
    value: graph.resolve(BREAK_PATH, { ...DEFAULT_SELECTION, ...conditions }),
  }))
}

/** Every combination of contexts the Resolver declares. */
export function contextPermutations(): ContextSelection[] {
  return Object.entries(CONTEXTS).reduce<ContextSelection[]>(
    (selections, [axis, { options }]) =>
      selections.flatMap((selection) => options.map((context) => ({ ...selection, [axis]: context }))),
    [{}],
  )
}

/**
 * The CSS that puts a visitor's edits on the page. A rebrand rewrites base
 * variables. A broken rule writes the frozen literals under the selector
 * Primitree uses for each combination of contexts, so they win there too.
 */
export function editsCss(edits: GraphEdits): string {
  const graph = editedGraph(edits)
  const rules: string[] = []
  if (edits.literals) {
    const declarations = Object.entries(edits.literals).map(([path, value]) => `${cssVar(path)}: ${formatValue(typeOf(path)!, value, false).css};`)
    // Tripled so it outranks the compound context block, which restates every base variable.
    rules.push(`:root:root:root { ${declarations.join(' ')} }`)
  }
  if (edits.frozen) {
    for (const selection of contextPermutations()) {
      const selector = Object.entries(selection)
        .filter(([axis, context]) => CONTEXTS[axis].default !== context)
        .map(([axis, context]) => `[data-${axis}='${context}']`)
        .join('')
      rules.push(`${selector || ':root'} { ${cssVar(BREAK_PATH)}: ${graph.chain(BREAK_PATH, selection)!.value.css}; }`)
    }
  }
  return rules.join('\n')
}
