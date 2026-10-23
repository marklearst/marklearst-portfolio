// Scans MDX. Its color literals are content (token examples in the writing and
// in code samples), so only class attributes count, read whole even when they
// span lines. Fenced code is blanked first, keeping line numbers, and class
// attributes quoted inside inline code are skipped.
import { classifyClassList } from './tailwind.mjs'

const CLASS_ATTRIBUTE = /\bclass(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*(?:`([^`]*)`|"([^"]*)"|'([^']*)')\s*\})/g
const RAW_COMMENT = /\{\s*\/\*[\s\S]*?\*\/\s*\}|<!--[\s\S]*?-->/g

export function scanMdx(source) {
  const blank = (match) => match.replace(/[^\n]/g, ' ')
  const text = source.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
  // Inline code in the writing, but not a template literal in className={`...`}.
  const inlineCode = [...text.matchAll(/`[^`\n]*`/g)]
    .filter((m) => !/\{\s*$/.test(text.slice(Math.max(0, m.index - 20), m.index)))
    .map((m) => [m.index, m.index + m[0].length])
  const inCode = (index) => inlineCode.some(([start, end]) => index >= start && index < end)
  const lineAt = (index) => text.slice(0, index).split('\n').length
  const lines = source.split('\n')

  const exempt = new Set()
  for (const m of text.matchAll(RAW_COMMENT)) {
    if (inCode(m.index) || !/\braw:/.test(m[0])) continue
    const first = lineAt(m.index)
    const last = lineAt(m.index + m[0].length)
    for (let line = first; line <= last; line++) exempt.add(line)
    if (/^\s*$/.test(text.slice(text.lastIndexOf('\n', m.index - 1) + 1, m.index))) exempt.add(last + 1)
  }

  const hits = []
  for (const m of text.matchAll(CLASS_ATTRIBUTE)) {
    const line = lineAt(m.index)
    if (inCode(m.index) || exempt.has(line)) continue
    const value = m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5]
    const { hits: counts } = classifyClassList(value.replace(/\$\{[^}]*\}/g, ' '))
    for (const [category, n] of Object.entries(counts)) {
      for (let i = 0; i < n; i++) hits.push({ category, line, text: lines[line - 1].trim().slice(0, 140) })
    }
  }
  return hits
}
