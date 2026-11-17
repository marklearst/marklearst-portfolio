import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { initializeTheme, resolveTheme, themePreference } from './theme-preference.mjs'

test('the serialized prepaint function applies stored choices and system fallback without imports', () => {
  const colors = { dark: '#111111', light: '#ffffff' }
  for (const [stored, light, expected] of [
    [null, false, 'dark'], [null, true, 'light'], ['dark', true, 'dark'],
    ['light', false, 'light'], ['invalid', true, 'light'], ['system', false, 'dark'],
  ]) {
    const root = { dataset: {} }
    const metas = [{ content: colors.dark }, { content: colors.light }]
    const context = {
      localStorage: { getItem: () => stored },
      matchMedia: () => ({ matches: light }),
      document: { documentElement: root, querySelectorAll: () => metas },
    }
    vm.runInNewContext(`(${initializeTheme.toString()})(${JSON.stringify(colors)})`, context)
    assert.equal(root.dataset.theme, expected)
    assert.ok(metas.every(meta => meta.content === colors[expected]))
    assert.equal(resolveTheme(themePreference(stored), light), expected)
  }
})

test('blocked preference storage still permits a light first paint', () => {
  const root = { dataset: {} }
  vm.runInNewContext(`(${initializeTheme.toString()})({dark:'#111111',light:'#ffffff'})`, {
    localStorage: { getItem: () => { throw new Error('Storage denied') } },
    matchMedia: () => ({ matches: true }),
    document: { documentElement: root, querySelectorAll: () => [] },
  })
  assert.equal(root.dataset.theme, 'light')
})
