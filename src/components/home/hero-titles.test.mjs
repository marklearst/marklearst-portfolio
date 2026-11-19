import assert from 'node:assert/strict'
import test from 'node:test'
import { FINAL_TITLE, HERO_TITLES, INITIAL_FRAME, titleFrame } from './hero-titles.ts'

const context = { motion: 'default', blocked: false }
const next = state => titleFrame(state, { type: 'advance', phase: state.phase, index: state.index })
const enter = () => titleFrame(INITIAL_FRAME, { type: 'start', intro: true, context })
const start = () => next(next(enter()))

test('the opening pair arrives once and a grab during its entrance holds the first title', () => {
  const initial = enter()
  assert.equal(initial.phase, 'entering')
  const held = titleFrame(initial, { type: 'hold', incoming: false })
  assert.equal(held.index, 0)
  assert.equal(held.phase, 'held')
  assert.deepEqual(titleFrame(held, { type: 'advance', phase: 'entering', index: 0 }), held)
  const dock = next(initial)
  assert.equal(dock.phase, 'docking')
  const grabbed = titleFrame(dock, { type: 'hold', incoming: false })
  assert.equal(grabbed.phase, 'held')
  assert.equal(titleFrame(grabbed, { type: 'advance', phase: 'docking', index: 0 }), grabbed)
  assert.equal(start().phase, 'reading')
  assert.equal(titleFrame(INITIAL_FRAME, { type: 'start', intro: false, context }).phase, 'finished')
})

test('the last title is the resting frame until an explicit replay', () => {
  let state = start()
  const entries = [HERO_TITLES[state.index].join(' ')]
  for (let i = 1; i < HERO_TITLES.length; i++) {
    state = next(next(state))
    entries.push(HERO_TITLES[state.index].join(' '))
  }
  assert.deepEqual(entries, ['Design Engineer', 'Frontend Architect', 'Motion Designer', 'Design Systems', 'Frontend Engineer'])
  assert.deepEqual(HERO_TITLES[state.index], ['Frontend', 'Engineer'])
  assert.equal(state.phase, 'finished')
  assert.deepEqual(next(state), state)
  assert.equal(titleFrame(state, { type: 'toggle', incoming: false }).index, 0)
})

test('taking the slider during either half holds the current words against late completions', () => {
  const outgoing = next(start())
  for (const incoming of [false, true]) {
    const turning = outgoing
    const held = titleFrame(turning, { type: 'hold', incoming })
    assert.equal(held.index, turning.index + Number(incoming))
    assert.equal(held.phase, 'held')
    const late = titleFrame(held, { type: 'advance', phase: turning.phase, index: turning.index })
    assert.deepEqual(late, held)
    assert.equal(titleFrame(held, { type: 'toggle', incoming: false }).phase, 'reading')
  }
})

test('hover, Inspect and tab visibility restore readable lettering and respect a deliberate hold', () => {
  const turning = next(start())
  const block = state => titleFrame(state, { type: 'context', incoming: false, context: { ...context, blocked: true } })
  assert.equal(block(turning).index, turning.index)
  assert.equal(block(turning).phase, 'reading')
  assert.deepEqual(next(block(turning)), block(turning))
  const held = titleFrame(turning, { type: 'hold', incoming: false })
  assert.deepEqual(titleFrame(block(held), { type: 'context', incoming: false, context }), held)
})

test('Reduced starts at the final title and allows manual changes without a turn', () => {
  const reduced = { motion: 'reduced', blocked: false }
  const final = titleFrame(INITIAL_FRAME, { type: 'start', intro: true, context: reduced })
  assert.equal(final.index, FINAL_TITLE)
  const manual = titleFrame(final, { type: 'toggle', incoming: false })
  assert.equal(manual.index, 0)
  assert.equal(manual.phase, 'held')
  assert.deepEqual(next(manual), manual)
  assert.equal(titleFrame(next(start()), { type: 'context', incoming: false, context: reduced }).phase, 'finished')
})
