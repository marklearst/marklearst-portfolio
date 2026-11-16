import graph from '@/tokens/generated/graph.json'

// The token graph the build checked and the inspector runs on: every token,
// its value in each context, the layer policy, and the check's result.
export const dynamic = 'force-static'

export function GET() {
  return Response.json(graph)
}
