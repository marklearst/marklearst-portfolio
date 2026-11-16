import assert from 'node:assert/strict'
import test from 'node:test'
import { accentFor, contrast, hueOf } from './brand.ts'

// The site's own surfaces and label, so these tests hold the rule to what the site asks of it.
const DARK = ['#141414', '#1A1A1A', '#262626']
const LIGHT = ['#F7F7F3', '#FFFFFF', '#ECECE6']
/** A fill under a light label, seen as a mark on every dark surface. */
const FILL = [{ against: '#F4F4F2', floor: 4.5 }, ...DARK.map((against) => ({ against, floor: 3 }))]
/** Text on every dark surface. */
const TEXT = DARK.map((against) => ({ against, floor: 4.5 }))
/** A fill and text on light surfaces, under a light label. */
const ON_LIGHT = [{ against: '#F7F7F3', floor: 4.5 }, ...LIGHT.map((against) => ({ against, floor: 4.5 }))]
const HUES = Array.from({ length: 360 }, (_, hue) => hue)
const hueGap = (a, b) => { const gap = Math.abs(a - b) % 360; return gap > 180 ? 360 - gap : gap }

for (const [name, requirements] of [['a fill on dark', FILL], ['text on dark', TEXT], ['the accent on light', ON_LIGHT]]) {
  test(`every hue holds every requirement as ${name}`, () => {
    for (const hue of HUES) {
      const tone = accentFor(hue, requirements)
      for (const { against, floor } of requirements) {
        const ratio = contrast(tone.hex, against)
        assert.ok(ratio >= floor, `hue ${hue} gave ${tone.hex}: ${ratio.toFixed(2)}:1 against ${against}, floor ${floor}`)
      }
    }
  })
}

test('a tone keeps the hue it was asked for', () => {
  for (const hue of HUES) {
    const tone = accentFor(hue, TEXT)
    assert.ok(hueGap(hueOf(tone.hex), hue) < 4, `hue ${hue} came back as ${hueOf(tone.hex).toFixed(1)} (${tone.hex})`)
  }
})

test('neighboring hues get neighboring colors, so a drag never jumps', () => {
  const distance = (a, b) => Math.hypot(...a.components.map((channel, i) => channel - b.components[i]))
  for (const requirements of [FILL, TEXT, ON_LIGHT]) {
    for (const hue of HUES) {
      const here = accentFor(hue, requirements)
      const next = accentFor((hue + 1) % 360, requirements)
      assert.ok(distance(here, next) < 0.12, `hue ${hue} to ${hue + 1}: ${here.hex} to ${next.hex}`)
    }
  }
})

test('requirements that can not all hold return the nearest miss, not a failure', () => {
  // No color is 7:1 against both white and black.
  const tone = accentFor(22, [{ against: '#FFFFFF', floor: 7 }, { against: '#000000', floor: 7 }])
  assert.match(tone.hex, /^#[0-9A-F]{6}$/)
  assert.ok(Math.abs(contrast(tone.hex, '#FFFFFF') - contrast(tone.hex, '#000000')) < 0.4, tone.hex)
})

test('components are the DTCG form of the hex', () => {
  const tone = accentFor(220, TEXT)
  const hex = `#${tone.components.map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`
  assert.equal(hex, tone.hex)
})

test('hueOf reads the hue of an sRGB color', () => {
  assert.ok(hueGap(hueOf('#FF0000'), 29.2) < 0.5)
  assert.ok(hueGap(hueOf('#00FF00'), 142.5) < 0.5)
  assert.ok(hueGap(hueOf('#0000FF'), 264.1) < 0.5)
})
