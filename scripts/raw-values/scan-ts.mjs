// Scans TypeScript and TSX with the TypeScript compiler's syntax tree, so a
// string is one node however many lines it spans, a template literal's
// ${expressions} are never read as text, and every literal goes through
// exactly one of these paths:
//
// - Style entries: an object property whose key is a CSS property, such as
//   { padding: '80px' } or { lineHeight: 0.9 }, classified like that property.
//   A bare number means px, as in React, except on unitless properties.
// - Motion options: duration and delay numbers and easing strings in objects,
//   as passed to Element.animate(), plus setTimeout and setInterval delays.
// - JSX color attributes: fill, stroke, color, and the SVG stop, flood, and
//   lighting colors.
// - Every other string: Tailwind classes, then literal colors, literal var()
//   fallbacks, and easing functions in what's left. Other JSX attributes (href,
//   d, alt, aria-*) are skipped, since their values aren't styles.
//
// Values computed at runtime, imported constants, and ternaries aren't
// literals, so they're out of scope; the strings inside a ternary still go
// through the last path.
import ts from 'typescript'
import { classifyDeclaration, classifyText, isDecisionProperty, merge } from './classify.mjs'
import { classifyClassList } from './tailwind.mjs'

const UNITLESS = new Set(['line-height', 'font-weight', 'z-index'])
const COLOR_ATTRIBUTES = new Set(['fill', 'stroke', 'color', 'stopColor', 'floodColor', 'lightingColor'])
const TIMERS = new Set(['setTimeout', 'setInterval'])
const kebab = (key) => (key.startsWith('--') ? key : key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`))

function keyOf(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) return name.text
  return null
}

/** The literal text of a string or template, with each ${expression} as an opaque token reference. */
function staticText(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isTemplateExpression(node)) return node.head.text + node.templateSpans.map((span) => ` var(--expression) ${span.literal.text}`).join('')
  return null
}

function numericText(node) {
  if (ts.isNumericLiteral(node)) return node.text
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) return `-${node.operand.text}`
  return null
}

/** The value a style entry sets, as CSS text, or null when it isn't a literal. */
function styleValue(node, prop) {
  const text = staticText(node)
  if (text !== null) return text
  const n = numericText(node)
  if (n === null) return null
  return UNITLESS.has(prop) || Number(n) === 0 ? n : `${n}px`
}

const isStringish = (node) => ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)

/** The JSX attribute a string feeds, through cn(), ternaries, and the like. */
function jsxAttributeOf(node) {
  for (let cur = node.parent; cur; cur = cur.parent) {
    if (ts.isJsxAttribute(cur)) return cur.name.getText()
    if (ts.isJsxExpression(cur) || ts.isParenthesizedExpression(cur) || ts.isConditionalExpression(cur) || ts.isBinaryExpression(cur)
      || ts.isCallExpression(cur) || ts.isArrayLiteralExpression(cur) || ts.isTemplateSpan(cur) || ts.isTemplateExpression(cur)) continue
    return null
  }
  return null
}

/** Strings that are never design values: module paths, type literals, object keys. */
function isSkippedString(node) {
  const parent = node.parent
  return ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent) || ts.isExternalModuleReference(parent) || ts.isLiteralTypeNode(parent)
    || ((ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent)) && parent.name === node)
    || (ts.isElementAccessExpression(parent) && parent.argumentExpression === node)
}

/** Lines a raw: comment exempts: its own lines, and the next line when the comment stands alone. */
function exemptLines(sf, text) {
  const comments = new Map()
  const visit = (node) => {
    for (const range of ts.getLeadingCommentRanges(text, node.pos) ?? []) comments.set(range.pos, range.end)
    for (const range of ts.getTrailingCommentRanges(text, node.end) ?? []) comments.set(range.pos, range.end)
    if (ts.isJsxExpression(node) && !node.expression) {
      const inner = text.slice(node.pos, node.end)
      for (const m of inner.matchAll(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g)) comments.set(node.pos + m.index, node.pos + m.index + m[0].length)
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  const lineAt = (pos) => sf.getLineAndCharacterOfPosition(pos).line + 1
  const lines = new Set()
  for (const [pos, end] of comments) {
    if (!/\braw:/.test(text.slice(pos, end))) continue
    for (let line = lineAt(pos); line <= lineAt(end); line++) lines.add(line)
    const before = text.slice(text.lastIndexOf('\n', pos - 1) + 1, pos)
    if (/^\s*\{?\s*$/.test(before)) lines.add(lineAt(end) + 1)
  }
  return lines
}

export function scanTs(source, fileName = 'input.tsx') {
  const kind = fileName.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.TSX
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, kind)
  const lineAt = (pos) => sf.getLineAndCharacterOfPosition(pos).line + 1
  const sourceLines = source.split('\n')
  const exempt = exemptLines(sf, source)
  const consumed = new Set()
  const hits = []

  // A node is exempt when a raw: comment covers its line, or the line of the
  // property, attribute, element, or statement it belongs to.
  const isExempt = (node) => {
    for (let cur = node; cur && !ts.isSourceFile(cur); cur = cur.parent) {
      if (exempt.has(lineAt(cur.getStart(sf)))) return true
      if (ts.isStatement(cur) || ts.isJsxOpeningElement(cur) || ts.isJsxSelfClosingElement(cur)) break
    }
    return false
  }

  const push = (counts, node) => {
    if (!Object.keys(counts).length || isExempt(node)) return
    const line = lineAt(node.getStart(sf))
    const text = sourceLines[line - 1].trim().slice(0, 140)
    for (const [category, n] of Object.entries(counts)) for (let i = 0; i < n; i++) hits.push({ category, line, text })
  }

  const visit = (node) => {
    if (ts.isPropertyAssignment(node) && ts.isObjectLiteralExpression(node.parent)) {
      const key = keyOf(node.name)
      const init = node.initializer
      if (key && isDecisionProperty(kebab(key))) {
        const prop = kebab(key)
        const value = styleValue(init, prop)
        if (value !== null) {
          push(classifyDeclaration(prop, value), init)
          consumed.add(init)
        }
      } else if (key === 'duration' || key === 'delay') {
        const n = numericText(init)
        if (n !== null && Number(n) !== 0) push({ duration: 1 }, init)
      } else if (key === 'easing') {
        const text = staticText(init)
        if (text !== null) {
          push(classifyDeclaration('transition-timing-function', text), init)
          consumed.add(init)
        }
      }
    }

    if (ts.isCallExpression(node)) {
      const callee = ts.isIdentifier(node.expression) ? node.expression.text : ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : null
      const delay = node.arguments[1]
      if (callee && TIMERS.has(callee) && delay) {
        const n = numericText(delay)
        if (n !== null && Number(n) !== 0) push({ duration: 1 }, delay)
      }
    }

    if (isStringish(node) && !consumed.has(node) && !isSkippedString(node)) {
      const text = staticText(node)
      const attribute = jsxAttributeOf(node)
      if (attribute && COLOR_ATTRIBUTES.has(attribute)) {
        push(classifyDeclaration(kebab(attribute), text), node)
      } else if (!attribute || attribute === 'className' || attribute === 'class') {
        const { hits: classes, rest } = classifyClassList(text)
        push(merge(classes, classifyText(rest)), node)
      }
    }

    // A template's ${expressions} are code, visited on their own.
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return hits
}
