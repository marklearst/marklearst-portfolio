import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import matter from 'gray-matter'
import { getAdjacentContent, orderArtifacts } from './adjacent-content.ts'
import { PROJECTS_IN_DISPLAY_ORDER } from '../../data/projects.ts'

test('adjacent navigation stops at both endpoints and never links to itself', () => {
  const items = [{ slug: 'one' }, { slug: 'two' }, { slug: 'three' }]
  assert.deepEqual(getAdjacentContent(items, 'one'), { previous: null, next: items[1] })
  assert.deepEqual(getAdjacentContent(items, 'two'), { previous: items[0], next: items[2] })
  assert.deepEqual(getAdjacentContent(items, 'three'), { previous: items[1], next: null })
  assert.deepEqual(getAdjacentContent([items[0]], 'one'), { previous: null, next: null })
})

test('missing current content fails clearly instead of returning an unrelated next item', () => {
  assert.throws(() => getAdjacentContent([], 'missing'), /Unknown content slug: missing/)
  assert.throws(() => getAdjacentContent([{ slug: 'one' }], 'missing'), /Unknown content slug: missing/)
})

test('artifact ordering is newest first, keeps tied input order, and does not mutate its source', () => {
  const items = [
    { slug: 'old-pinned', publishedAt: new Date('2024-01-01'), pinned: true },
    { slug: 'new', publishedAt: new Date('2026-01-01') },
    { slug: 'same-date', publishedAt: new Date('2026-01-01') },
  ]
  const original = [...items]
  assert.deepEqual(orderArtifacts(items).map(item => item.slug), ['new', 'same-date', 'old-pinned'])
  assert.deepEqual(items, original)
})

test('the project sequence covers every case-study route once with its actual page title', () => {
  const workRoot = new URL('../../app/work/', import.meta.url)
  const routeSlugs = fs.readdirSync(workRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(new URL(`${entry.name}/page.tsx`, workRoot)))
    .map(entry => entry.name)
  const slugs = PROJECTS_IN_DISPLAY_ORDER.map(project => project.slug)
  assert.equal(new Set(slugs).size, slugs.length)
  assert.deepEqual([...slugs].sort(), routeSlugs.sort())

  for (const project of PROJECTS_IN_DISPLAY_ORDER) {
    const content = fs.readFileSync(new URL(`../../content/case-studies/${project.slug}.mdx`, import.meta.url), 'utf8')
    const { data } = matter(content)
    assert.equal(project.title, data.title)
    assert.equal(project.route, `/work/${data.slug}`)
    const { previous, next } = getAdjacentContent(PROJECTS_IN_DISPLAY_ORDER, project.slug)
    if (previous) assert.equal(getAdjacentContent(PROJECTS_IN_DISPLAY_ORDER, previous.slug).next.slug, project.slug)
    if (next) assert.equal(getAdjacentContent(PROJECTS_IN_DISPLAY_ORDER, next.slug).previous.slug, project.slug)
  }
})

test('every registered artifact has a unique public slug and a complete, reversible navigation chain', () => {
  const registry = fs.readFileSync(new URL('./artifacts.ts', import.meta.url), 'utf8')
  const registeredFiles = [...registry.matchAll(/fileName: '([^']+\.mdx)'/g)].map(match => match[1])
  const contentRoot = new URL('../../content/artifacts/', import.meta.url)
  const contentFiles = fs.readdirSync(contentRoot).filter(file => path.extname(file) === '.mdx')
  assert.deepEqual([...registeredFiles].sort(), contentFiles.sort())

  const artifacts = orderArtifacts(registeredFiles.map(file => {
    const { data } = matter(fs.readFileSync(new URL(file, contentRoot), 'utf8'))
    assert.ok(data.title && data.slug)
    const publishedAt = new Date(data.published_at)
    assert.ok(Number.isFinite(publishedAt.getTime()))
    return { ...data, publishedAt }
  }))
  assert.equal(new Set(artifacts.map(item => item.slug)).size, artifacts.length)
  assert.equal(getAdjacentContent(artifacts, artifacts[0].slug).previous, null)
  assert.equal(getAdjacentContent(artifacts, artifacts.at(-1).slug).next, null)
  for (const item of artifacts) {
    const { previous, next } = getAdjacentContent(artifacts, item.slug)
    if (previous) assert.equal(getAdjacentContent(artifacts, previous.slug).next.title, item.title)
    if (next) assert.equal(getAdjacentContent(artifacts, next.slug).previous.title, item.title)
  }
})
