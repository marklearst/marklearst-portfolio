// Scans a stylesheet: declarations, @apply utilities, and the conditions of
// @media, @container, and @custom-media.
//
// A comment containing "raw:" exempts the node it's attached to and everything
// inside it: a sibling that starts on the comment's line, or, when the comment
// stands alone on its line, the sibling that starts on the very next line. So
// a comment above a declaration covers that declaration, and one above a rule
// or an @media block covers every declaration inside. A comment that opens a
// block (`.a { /* raw: */`) covers only the block's own condition, such as an
// @media breakpoint, never what's inside. Blank lines break the link, so a
// comment left behind by a deleted declaration exempts nothing.
import postcss from 'postcss'
import { classifyDeclaration, classifyMediaParams } from './classify.mjs'
import { classifyClass } from './tailwind.mjs'

const isExemption = (node) => node?.type === 'comment' && /\braw:/.test(node.text)
const startLine = (node) => node?.source?.start?.line
const endLine = (node) => node?.source?.end?.line

export function scanCss(source, from = 'input.css') {
  const lines = source.split('\n')
  const standsAlone = (comment) => /^\s*$/.test(lines[startLine(comment) - 1].slice(0, comment.source.start.column - 1))
  const sameLine = (comment, node) => isExemption(comment) && (startLine(node) === startLine(comment) || startLine(node) === endLine(comment))
  const nextLine = (comment, node) => isExemption(comment) && standsAlone(comment) && startLine(node) === endLine(comment) + 1

  // A sibling comment covers the node and everything inside it.
  const coveredBySibling = (node) => sameLine(node.prev(), node) || nextLine(node.prev(), node) || sameLine(node.next(), node)
  // A comment that opens the block covers the block's own condition only.
  const coveredByOpener = (node) => Boolean(node.nodes) && sameLine(node.first, node)
  const exempt = (node) => {
    if (coveredByOpener(node)) return true
    for (let cur = node; cur && cur.type !== 'root'; cur = cur.parent) if (coveredBySibling(cur)) return true
    return false
  }

  const hits = []
  const push = (counts, node, text) => {
    for (const [category, n] of Object.entries(counts)) {
      for (let i = 0; i < n; i++) hits.push({ category, line: startLine(node) ?? 0, text })
    }
  }
  postcss.parse(source, { from }).walk((node) => {
    if (node.type === 'decl') {
      if (!exempt(node)) push(classifyDeclaration(node.prop, node.value), node, `${node.prop}: ${node.value}`)
    } else if (node.type === 'atrule' && /^(?:media|container|custom-media)$/i.test(node.name)) {
      if (!exempt(node)) push({ breakpoint: classifyMediaParams(node.params) }, node, `@${node.name} ${node.params}`)
    } else if (node.type === 'atrule' && node.name === 'apply') {
      if (exempt(node)) return
      for (const cls of node.params.split(/\s+/).filter(Boolean)) push(classifyClass(cls), node, `@apply ${node.params}`)
    }
  })
  return hits
}
