// Scans a stylesheet: declarations, @apply utilities, and @media or @container
// conditions. A comment containing "raw:" exempts the node on its line, or the
// node on the next line when the comment sits on a line of its own.
import postcss from 'postcss'
import { classifyDeclaration, classifyMediaParams } from './classify.mjs'
import { classifyClass } from './tailwind.mjs'

const isExemption = (node) => node?.type === 'comment' && /\braw:/.test(node.text)
const lineOf = (node) => node?.source?.start?.line

function exempt(node) {
  const prev = node.prev()
  if (isExemption(prev) && lineOf(prev.prev()) !== lineOf(prev)) return true
  const next = node.type === 'atrule' ? node.first : node.next()
  return isExemption(next) && lineOf(next) === lineOf(node)
}

export function scanCss(source, from = 'input.css') {
  const hits = []
  const push = (counts, node, text) => {
    for (const [category, n] of Object.entries(counts)) {
      for (let i = 0; i < n; i++) hits.push({ category, line: lineOf(node) ?? 0, text })
    }
  }
  postcss.parse(source, { from }).walk((node) => {
    if (node.type === 'decl') {
      if (!exempt(node)) push(classifyDeclaration(node.prop, node.value), node, `${node.prop}: ${node.value}`)
    } else if (node.type === 'atrule' && /^(?:media|container)$/i.test(node.name)) {
      if (!exempt(node)) push({ breakpoint: classifyMediaParams(node.params) }, node, `@${node.name} ${node.params}`)
    } else if (node.type === 'atrule' && node.name === 'apply') {
      if (exempt(node)) return
      for (const cls of node.params.split(/\s+/).filter(Boolean)) push(classifyClass(cls), node, `@apply ${node.params}`)
    }
  })
  return hits
}
