import tokens from '@/tokens/generated/site.tokens.json'

// The site's tokens as one DTCG 2025.10 document: the Resolver's default
// context, the same file `primitree check` reads.
export const dynamic = 'force-static'

export function GET() {
  return Response.json(tokens)
}
