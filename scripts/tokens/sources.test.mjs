import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

// The token files are public: the repository shows them and /tokens.json serves
// them. A description says what a token is for. It is not the place for a link.

const ROOT = path.join(process.cwd(), 'src/tokens')
const files = [
  ...readdirSync(ROOT).filter((name) => name.endsWith('.json')).map((name) => path.join(ROOT, name)),
  path.join(ROOT, 'generated/site.tokens.json'),
]
const LINK = /https?:\/\/|www\./i

function descriptions(node, trail = []) {
  if (!node || typeof node !== 'object') return []
  return Object.entries(node).flatMap(([key, value]) =>
    key === '$description' || key === 'description' ? [{ at: trail.join('.'), text: String(value) }] : descriptions(value, [...trail, key]),
  )
}

test('no token description holds a link', () => {
  for (const file of files) {
    for (const { at, text } of descriptions(JSON.parse(readFileSync(file, 'utf8')))) {
      // The Resolver names its schema with a URL in $schema, which is not a description and is not read here.
      assert.ok(!LINK.test(text), `${path.relative(process.cwd(), file)} ${at || '(root)'}: "${text}"`)
    }
  }
})
