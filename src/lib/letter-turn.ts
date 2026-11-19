import { spring } from 'motion'
import { durationMs, easing, numberToken } from './motion-tokens'

/** One clock for both faces. The closing brace belongs to the wave just like a letter. */
export function turnLetters(outgoing: HTMLElement[], incoming: HTMLElement[], returning = false) {
  const beat = durationMs('--duration-causal')
  const step = beat * 5 / 6
  const timing = spring({
    keyframes: [0, 1],
    stiffness: numberToken('--semantic-spring-letter-stiffness'),
    damping: numberToken('--semantic-spring-letter-damping'),
  }).toString()
  const curve = timing.slice(timing.indexOf(' ') + 1)
  const duration = parseFloat(timing) * beat / durationMs('--duration-hop')
  const ease = CSS.supports('animation-timing-function', curve) ? curve : easing('--ease-out')
  const lift = numberToken('--space-4')
  const blur = numberToken('--space-1')
  const flat = { opacity: 1, transform: 'translateY(0px) rotateX(0deg)', filter: 'blur(0px)' }
  const upper = { opacity: 0, transform: `translateY(-${lift}px) rotateX(80deg)`, filter: `blur(${blur}px)` }
  const lower = { opacity: 0, transform: `translateY(${lift}px) rotateX(-90deg)`, filter: `blur(${blur}px)` }

  function play(letters: HTMLElement[], arriving: boolean) {
    const frames = arriving ? [returning ? upper : lower, flat] : [flat, returning ? lower : upper]
    const gap = arriving && returning ? beat : step
    const lead = arriving && !returning ? 2 * step : 0
    return letters.map((letter, i) => {
      const order = returning ? letters.length - 1 - i : Number(letter.dataset.letterOrder ?? i)
      return letter.animate(frames, { duration, easing: ease, delay: lead + order * gap, fill: 'both' })
    })
  }

  const animations = [...play(outgoing, false), ...play(incoming, true)]
  // Give earlier letters the same endpoint as the last one. Reversing mid-wave
  // then retraces the stagger, including the letters that already landed.
  const end = Math.max(...animations.map(a => Number(a.effect!.getComputedTiming().endTime)))
  for (const animation of animations) {
    const effect = animation.effect!
    effect.updateTiming({ endDelay: end - Number(effect.getComputedTiming().endTime) })
  }
  return {
    finished: Promise.all(animations.map(animation => animation.finished)),
    aim: (open: boolean) => animations.forEach(a => a.updatePlaybackRate(open !== returning ? 1 : -1)),
    cancel: () => animations.forEach(animation => animation.cancel()),
  }
}
