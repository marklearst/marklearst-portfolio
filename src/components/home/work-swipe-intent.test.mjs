import assert from 'node:assert/strict'
import test from 'node:test'
import { swipeDestination } from './work-swipe-intent.ts'

test('deliberate distance advances one project in either direction', () => {
  assert.equal(swipeDestination(1, 3, 340, -100, 0, 100), 2)
  assert.equal(swipeDestination(1, 3, 340, 100, 0, 100), 0)
  assert.equal(swipeDestination(0, 3, 800, -800, -4, 0), 1)
})

test('a short flick advances but a held or small movement settles back', () => {
  assert.equal(swipeDestination(1, 3, 340, -30, -.5, 10), 2)
  assert.equal(swipeDestination(1, 3, 340, -30, -.5, 100), 1)
  assert.equal(swipeDestination(1, 3, 340, -20, -.1, 10), 1)
})

test('first and last projects resist without wrapping', () => {
  assert.equal(swipeDestination(0, 3, 340, 100, 2, 10), 0)
  assert.equal(swipeDestination(2, 3, 340, -100, -2, 10), 2)
})
