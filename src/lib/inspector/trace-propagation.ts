import type { TokenTrace, TraceEdge } from './trace'

export interface TracePropagation {
  depths: Map<string, number>
  edges: TraceEdge[]
}

export function tracePropagation(before: TokenTrace, after: TokenTrace): TracePropagation {
  const previous = new Map(before.nodes.map(node => [node.path, node.value.css]))
  const changed = new Set(after.nodes.filter(node => node.value.kind === 'color' &&
    previous.has(node.path) && previous.get(node.path) !== node.value.css && !node.finding).map(node => node.path))
  const depths = new Map(after.nodes.filter(node => node.layer === 'base' && changed.has(node.path)).map(node => [node.path, 0]))
  const edges: TraceEdge[] = []
  for (const [source, depth] of depths) {
    for (const edge of after.edges) {
      if (edge.from !== source || edge.broken || !changed.has(edge.to)) continue
      edges.push(edge)
      if (!depths.has(edge.to)) depths.set(edge.to, depth + 1)
    }
  }
  return { depths, edges }
}
