const WORDS_PER_MINUTE = 200

const stripFrontmatter = (content: string) =>
  content.replace(/^---[\s\S]*?---\s*/u, '')

export const estimateReadingTime = (content: string) => {
  const text = stripFrontmatter(content)
  const words = text.match(/\b[\w'-]+\b/gu)?.length ?? 0
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))

  return {
    minutes,
    words,
  }
}
