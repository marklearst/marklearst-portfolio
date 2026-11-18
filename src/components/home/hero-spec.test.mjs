import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { SPECIMEN_SIZE } from './hero-spec.ts'

test('the blueprint names the real Primitree token consumed by the headline', () => {
  const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
  const adapter = JSON.parse(read('../../tokens/css-adapter.json')).tailwind
  const tokens = JSON.parse(read('../../tokens/generated/site.tokens.json'))
  const name = /\.name \{([^}]+)\}/.exec(read('./Hero.module.css'))[1]
  assert.ok(name.includes('var(--text-specimen)'))
  assert.equal(adapter['--text-specimen'].token, SPECIMEN_SIZE)
  assert.ok(SPECIMEN_SIZE.split('.').reduce((node, part) => node[part], tokens).$value)
})
