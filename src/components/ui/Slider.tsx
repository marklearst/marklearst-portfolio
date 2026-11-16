'use client'

import type { ComponentProps } from 'react'
import styles from './Slider.module.css'

export interface SliderProps extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'children'> {
  value: number
  /** Runs for every step the thumb takes. */
  onValueChange?: (value: number) => void
}

/**
 * One number picked from a range. It is the browser's own range input, so the
 * arrow, Home, End, and Page keys already work. Name it with a label or
 * `aria-label`, and say what a value means with `aria-valuetext`.
 *
 * `className` and `style` go to the wrapper. Everything else, `ref` included,
 * goes to the input. Paint the track with `--slider-track` and the thumb with
 * `--slider-thumb`.
 */
export function Slider({ onValueChange, onChange, className, style, ...props }: SliderProps) {
  return (
    <span className={className ? `${styles.slider} ${className}` : styles.slider} style={style}>
      <span className={styles.track} aria-hidden='true' />
      <input
        {...props}
        type='range'
        className={styles.input}
        onChange={(event) => {
          onChange?.(event)
          if (!event.defaultPrevented) onValueChange?.(event.currentTarget.valueAsNumber)
        }}
      />
    </span>
  )
}
