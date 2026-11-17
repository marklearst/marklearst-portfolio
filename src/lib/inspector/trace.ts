import type { TokenGraph } from './graph'
import type { ChainValue, ContextSelection, Finding } from './types'

export interface TraceNode {
  path: string
  layer: string
  value: ChainValue
  variable: string | null
  finding: Finding | null
}

export interface TraceEdge {
  from: string
  to: string
  broken: boolean
}

export interface TokenTrace {
  focus: string
  nodes: TraceNode[]
  edges: TraceEdge[]
  dependents: number
}

/** A token's ancestors and dependents, including the former reference when a rule severed it. */
export function traceTokens(graph: TokenGraph, built: TokenGraph, focus: string, selection: ContextSelection, variable: (path: string) => string | null): TokenTrace {
  const chain = graph.chain(focus, selection)
  if (!chain) throw new Error(`Cannot trace unknown token ${focus}.`)
  const dependents = graph.dependents(focus, selection).filter((token) => token.path !== focus)
  const paths = new Set([...chain.steps.map((step) => step.path), ...dependents.map((token) => token.path)])
  const nodes: TraceNode[] = []
  const edges: TraceEdge[] = []
  for (const path of paths) {
    const resolved = graph.chain(path, selection)
    if (!resolved) throw new Error(`The trace contains an unresolved token ${path}.`)
    const step = resolved.steps[0]
    const broken = step.finding?.ruleId === 'PT1003'
    const parent = (broken ? built.chain(path, selection) : resolved)?.steps[1]?.path
    if (parent) {
      paths.add(parent)
      edges.push({ from: parent, to: path, broken })
    }
    nodes.push({ path, layer: step.layer, value: resolved.value, variable: variable(path), finding: step.finding })
  }
  return { focus, nodes, edges, dependents: dependents.length }
}
