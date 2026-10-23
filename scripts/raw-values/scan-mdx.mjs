// Scans MDX with the same parser the site builds with (remark-parse and
// remark-mdx), so fenced code, inline code, and prose are content and only JSX
// is interface. Each JSX attribute is handed to the TypeScript scanner as a TSX
// attribute, so className, style, fill, and the rest count exactly as they do
// in a component, and a code={`...`} prop is skipped like any other non-style
// attribute.
//
// A {/* raw: ... */} expression exempts the JSX elements that start on its
// line, or on the next line when it stands alone, and everything inside them.
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { scanTs } from './scan-ts.mjs'

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMdx)
const isElement = (node) => node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement'
const isExpression = (node) => node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression'

/** Blank YAML frontmatter, which the site strips with gray-matter before MDX sees it. Line numbers are kept. */
const withoutFrontmatter = (source) => source.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(?=\r?\n|$)/, (block) => block.replace(/[^\n]/g, ''))

export function scanMdx(source, fileName = 'input.mdx') {
  const text = withoutFrontmatter(source)
  const tree = processor.parse({ value: text, path: fileName })
  const lines = text.split('\n')
  const hits = []

  const exempt = new Set()
  const walkComments = (node) => {
    if (isExpression(node) && /\braw:/.test(node.value) && node.position) {
      const { start, end } = node.position
      for (let line = start.line; line <= end.line; line++) exempt.add(line)
      if (/^\s*$/.test(lines[start.line - 1].slice(0, start.column - 1))) exempt.add(end.line + 1)
    }
    for (const child of node.children ?? []) walkComments(child)
  }
  walkComments(tree)

  const walk = (node, covered) => {
    const skip = covered || (isElement(node) && exempt.has(node.position?.start.line))
    if (isElement(node) && !skip) {
      for (const attribute of node.attributes ?? []) {
        if (attribute.type !== 'mdxJsxAttribute' || attribute.value === null || attribute.value === undefined) continue
        const line = attribute.position?.start.line ?? node.position.start.line
        const expression = typeof attribute.value === 'string' ? JSON.stringify(attribute.value) : attribute.value.value
        for (const hit of scanTs(`<x ${attribute.name}={${expression}} />`, 'attribute.tsx')) {
          const at = line + hit.line - 1
          hits.push({ category: hit.category, line: at, text: (lines[at - 1] ?? '').trim().slice(0, 140) })
        }
      }
    }
    for (const child of node.children ?? []) walk(child, skip)
  }
  walk(tree, false)
  return hits
}
