// Scans MDX with the same parser the site builds with (remark-parse and
// remark-mdx), so fenced code, inline code, frontmatter, and prose are content
// and everything that is JavaScript is interface. Each piece of JavaScript is
// handed to the TypeScript scanner in the form it has in a component:
//
// - a JSX attribute as a TSX attribute, so className, style, and fill count
//   exactly as in a component and a code={`...`} prop is skipped like any
//   other non style attribute;
// - a spread attribute as a TSX spread;
// - an expression ({cond && <p className="text-lg" />}) as an expression;
// - an import or export block as a module.
//
// A {/* raw: ... */} expression exempts the JavaScript that starts on its
// line, or on the next line when it stands alone, and everything inside it.
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { scanTs } from './scan-ts.mjs'

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMdx)
const isElement = (node) => node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement'
const isExpression = (node) => node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression'
const isJavaScript = (node) => isElement(node) || isExpression(node) || node.type === 'mdxjsEsm'
const isComment = (value) => /^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n?\s*)+$/.test(value)

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

  // Scan a piece of JavaScript as TSX, mapping its lines back to the MDX file.
  const scan = (snippet, line) => {
    for (const hit of scanTs(snippet, 'mdx.tsx')) {
      const at = line + hit.line - 1
      hits.push({ category: hit.category, line: at, text: (lines[at - 1] ?? '').trim().slice(0, 140) })
    }
  }

  const walk = (node, covered) => {
    const line = node.position?.start.line
    // Only JavaScript is exempted by line: a markdown paragraph that happens to start on the comment's line isn't.
    const skip = covered || (isJavaScript(node) && exempt.has(line))
    if (!skip) {
      if (isElement(node)) {
        for (const attribute of node.attributes ?? []) {
          const at = attribute.position?.start.line ?? line
          if (attribute.type === 'mdxJsxExpressionAttribute') scan(`<x {${attribute.value}} />`, at)
          else if (attribute.value !== null && attribute.value !== undefined) {
            const expression = typeof attribute.value === 'string' ? JSON.stringify(attribute.value) : attribute.value.value
            scan(`<x ${attribute.name}={${expression}} />`, at)
          }
        }
      } else if (isExpression(node) && !isComment(node.value)) {
        scan(`(${node.value})`, line)
      } else if (node.type === 'mdxjsEsm') {
        scan(node.value, line)
      }
    }
    for (const child of node.children ?? []) walk(child, skip)
  }
  walk(tree, false)
  return hits
}
