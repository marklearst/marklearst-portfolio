/**
 * Central timing configuration for terminal animations
 * All values can be adjusted by changing SPEED_MULTIPLIER
 */

// Speed multiplier: 0.85 = 15% faster, 1.0 = default speed, 1.2 = 20% slower
export const SPEED_MULTIPLIER = 0.85

/**
 * Calculate timing value with speed multiplier applied
 */
export function timing(baseValue: number): number {
  return baseValue * SPEED_MULTIPLIER
}

/**
 * Terminal typing speeds (ms per character)
 */
export const TYPING_SPEED = {
  min: timing(30), // Faster typing - was 60
  max: timing(50), // Faster typing - was 100
}

/**
 * Animation durations (ms or seconds depending on context)
 */
export const DURATION = {
  // Terminal transition stages
  overlayFadeIn: timing(0.25), // seconds
  overlayFadeOut: timing(0.3), // seconds
  overlayContentIn: timing(0.35), // seconds
  overlayContentOut: timing(0.25), // seconds
  progressBar: timing(0.9), // seconds
  packageStagger: timing(0.12), // seconds per package
  outputReveal: timing(0.35), // seconds - show "✓ Ready" faster
  holdBeforeNav: timing(0.12), // seconds - quick but readable for work routes
  holdBeforeNavHome: timing(1.1), // seconds - longer hold for whoami command only
  navDelay: timing(220), // milliseconds - keep overlay visible during page load

  // Text animations
  loadingFadeIn: timing(0.3), // seconds

  // Route-specific durations
  homeRoute: timing(1200), // milliseconds
  workRoute: timing(1200), // milliseconds
  workRouteWithPackages: timing(1500), // milliseconds
  blogRoute: timing(1000), // milliseconds
  labRoute: timing(1200), // milliseconds
}
