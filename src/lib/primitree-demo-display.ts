/** Keep the generated rule verbatim; its preceding comment also mentions :root. */
export function getPrimitreeCssExcerpt(css: string | null): string | null {
  if (css === null) return null
  const ruleStart = css.indexOf('\n:root {')
  return ruleStart === -1 ? css : css.slice(ruleStart + 1)
}
