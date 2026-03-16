import { gsap } from 'gsap'

/**
 * Terminal typing animation utilities
 * Realistic character-by-character rendering with variable speed
 */

export interface TypingOptions {
  element: HTMLElement
  text: string
  minSpeed?: number // ms per character (min)
  maxSpeed?: number // ms per character (max)
  onComplete?: () => void
  cursor?: boolean
}

/**
 * Type text character-by-character with realistic timing
 */
export function typeText({
  element,
  text,
  minSpeed = 40,
  maxSpeed = 100,
  onComplete,
  cursor = true,
}: TypingOptions): gsap.core.Timeline {
  const tl = gsap.timeline({
    onComplete,
  })

  element.innerHTML = cursor
    ? '<span class="terminal-cursor">▊</span>'
    : ''

  const chars = text.split('')

  chars.forEach((char, i) => {
    const delay = gsap.utils.random(minSpeed, maxSpeed) / 1000

    tl.call(
      () => {
        if (cursor) {
          // Remove cursor, add character, re-add cursor
          element.innerHTML =
            element.innerHTML.replace(
              '<span class="terminal-cursor">▊</span>',
              '',
            ) +
            char +
            '<span class="terminal-cursor">▊</span>'
        } else {
          element.innerHTML += char
        }
      },
      [],
      i === 0 ? 0 : `+=${delay}`,
    )
  })

  // Remove cursor after typing completes
  if (cursor) {
    tl.call(() => {
      element.innerHTML = element.innerHTML.replace(
        '<span class="terminal-cursor">▊</span>',
        '',
      )
    })
  }

  return tl
}

/**
 * Animate progress bar from 0 to 100%
 */
export function animateProgressBar(
  element: HTMLElement,
  duration: number = 0.8,
): gsap.core.Tween {
  return gsap.fromTo(
    element,
    { width: '0%' },
    {
      width: '100%',
      duration,
      ease: 'power2.out',
    },
  )
}

/**
 * Animate package counter from 0 to target
 */
export function animateCounter(
  element: HTMLElement,
  target: number,
  duration: number = 1,
): gsap.core.Tween {
  const obj = { value: 0 }

  return gsap.to(obj, {
    value: target,
    duration,
    ease: 'none',
    onUpdate: () => {
      element.textContent = Math.floor(obj.value).toString()
    },
  })
}

/**
 * Show packages appearing one by one with checkmarks
 */
export function showPackages(
  containerElement: HTMLElement,
  packages: string[],
  staggerDelay: number = 0.15,
): gsap.core.Timeline {
  const tl = gsap.timeline()

  packages.forEach((pkg, i) => {
    tl.call(
      () => {
        const packageLine = document.createElement('div')
        packageLine.className = 'terminal-package-line'
        packageLine.innerHTML = `
          <span style="color: #a9dc75;">✓</span>
          <span style="color: rgb(252, 252, 250);">${pkg}</span>
        `
        packageLine.style.opacity = '0'
        containerElement.appendChild(packageLine)

        gsap.to(packageLine, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
      },
      [],
      i * staggerDelay,
    )
  })

  return tl
}

/**
 * Blink cursor animation
 */
export function blinkCursor(element: HTMLElement): gsap.core.Tween {
  return gsap.to(element, {
    opacity: 0,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: 'steps(1)',
  })
}
