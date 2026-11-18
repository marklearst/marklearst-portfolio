/** @typedef {'dark' | 'light'} Theme */
/** @typedef {Theme | 'system'} ThemePreference */
export const THEME_KEY = 'ml:theme'

/** @param {string | null | undefined} value @returns {ThemePreference} */
export function themePreference(value) {
  return value === 'dark' || value === 'light' ? value : 'system'
}

/** @param {ThemePreference} preference @param {boolean} light @returns {Theme} */
export function resolveTheme(preference, light) {
  return preference === 'system' ? light ? 'light' : 'dark' : preference
}

/** Self contained because the layout serializes it into the prepaint script.
 * @param {Record<Theme, string>} colors
 */
export function initializeTheme(colors) {
  let choice = null
  try { choice = localStorage.getItem('ml:theme') } catch { /* System preference still works. */ }
  const theme = choice === 'dark' || choice === 'light'
    ? choice
    : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) meta.content = colors[theme]
}
