import test from 'node:test'
import assert from 'node:assert/strict'
import { tokenFromHash, tokenHash, tokenHref } from './token-location.ts'

const paths = ['component.button.accent.background', 'semantic.color.accent.primary']

test('a shared trace link selects only an existing token', () => {
  for (const path of paths) {
    assert.equal(tokenFromHash(tokenHash(path), paths), path)
    assert.equal(tokenHref(path), `/system#token=${path}`)
  }
})

test('ordinary anchors, unknown paths and malformed escapes preserve local selection', () => {
  for (const hash of ['', '#work', '#token=', '#token=unknown', '#token=%E0%A4%A', '#token=javascript%3Aalert(1)']) {
    assert.equal(tokenFromHash(hash, paths), null)
  }
})

test('encoded token names round trip without treating their characters as URL syntax', () => {
  const path = 'semantic.space.a b&c#d'
  assert.equal(tokenFromHash(tokenHash(path), [path]), path)
  assert.equal(tokenFromHash('#token=semantic.color.accent%2Eprimary', paths), paths[1])
})
