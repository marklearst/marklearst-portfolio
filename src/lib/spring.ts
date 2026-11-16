// A spring for values that have to keep their momentum: an outline that is
// sent to a new element while still travelling to the last one, or a panel let
// go of mid drag. A CSS transition restarts its curve from rest each time it is
// retargeted. A spring carries on at the speed it had.
//
// It is tuned the way a designer would say it: how long it should seem to take
// and how much it should bounce. The caller reads the first from a motion token,
// so in the reduced motion context, where that is zero, the spring arrives at once.

export interface Spring {
  /** Heads for new values, keeping whatever speed it has. `velocity` overrides that speed, per second. */
  to(values: readonly number[], velocity?: readonly number[]): void
  /** Goes straight to the values and stops. */
  set(values: readonly number[]): void
  stop(): void
}

/** Closer than this to its target, and slower than this per second, a value counts as arrived. */
const AT_REST = 0.25
const STILL = 2
/** A frame is never treated as longer than this, so a tab coming back from the background doesn't fling anything. */
const LONGEST_FRAME = 1 / 30
const STEPS = 8

/**
 * @param write     called with the current values on each frame
 * @param duration  how long a move should seem to take, in milliseconds. Asked once at the start of each move
 * @param bounce    0 settles without passing its target, up to about 0.4 for something playful
 */
export function createSpring(write: (values: number[]) => void, duration: () => number, bounce = 0): Spring {
  let position: number[] = []
  let velocity: number[] = []
  let target: number[] = []
  let frame = 0
  let last = 0
  let seconds = 0

  function tick(now: number) {
    const elapsed = Math.min(Math.max(now - last, 0) / 1000, LONGEST_FRAME)
    last = now
    if (seconds > 0) {
      // A spring that seems to take `seconds`: stiffness (2π / t)², damping 4π(1 - bounce) / t, unit mass.
      const stiffness = ((2 * Math.PI) / seconds) ** 2
      const damping = (4 * Math.PI * (1 - bounce)) / seconds
      const step = elapsed / STEPS
      for (let n = 0; n < STEPS; n += 1) {
        for (let i = 0; i < position.length; i += 1) {
          velocity[i] += (stiffness * (target[i] - position[i]) - damping * velocity[i]) * step
          position[i] += velocity[i] * step
        }
      }
    }
    const arrived = seconds <= 0 || position.every((value, i) => Math.abs(target[i] - value) < AT_REST && Math.abs(velocity[i]) < STILL)
    if (arrived) {
      position = [...target]
      velocity = target.map(() => 0)
    }
    write(position)
    frame = arrived ? 0 : requestAnimationFrame(tick)
  }

  return {
    to(values, speed) {
      if (position.length !== values.length) {
        // Nothing to travel from yet, so it starts where it is going.
        position = [...values]
        velocity = values.map(() => 0)
      }
      target = [...values]
      if (speed) velocity = [...speed]
      seconds = duration() / 1000
      if (!frame) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    },
    set(values) {
      cancelAnimationFrame(frame)
      frame = 0
      position = [...values]
      target = [...values]
      velocity = values.map(() => 0)
      write(position)
    },
    stop() {
      cancelAnimationFrame(frame)
      frame = 0
    },
  }
}
