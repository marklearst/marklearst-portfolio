'use client'

import { createContext, use, useId, type ComponentProps, type ReactNode } from 'react'
import styles from './Segmented.module.css'

interface Group {
  name: string
  value: string
  select: (value: string) => void
}

const SegmentedGroup = createContext<Group | null>(null)

export interface SegmentedProps<Value extends string> extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue' | 'role'> {
  /** The chosen option. */
  value: Value
  onValueChange?: (value: Value) => void
  /** Groups the radio inputs. One is made up when this is left out. */
  name?: string
  children: ReactNode
}

/**
 * A few options where exactly one is on. Underneath it is a group of radio
 * inputs, so the arrow keys move between options and a form can read it.
 * Name it with `aria-label` or `aria-labelledby`.
 *
 *   <Segmented aria-label='Motion' value={motion} onValueChange={setMotion}>
 *     <SegmentedOption value='reduced'>Reduced</SegmentedOption>
 *     <SegmentedOption value='default'>Default</SegmentedOption>
 *   </Segmented>
 */
export function Segmented<Value extends string>({ value, onValueChange, name, className, children, ...props }: SegmentedProps<Value>) {
  const generated = useId()
  const group: Group = { name: name ?? generated, value, select: (next) => onValueChange?.(next as Value) }

  return (
    <SegmentedGroup value={group}>
      <div {...props} role='radiogroup' className={className ? `${styles.segmented} ${className}` : styles.segmented}>
        {children}
      </div>
    </SegmentedGroup>
  )
}

export interface SegmentedOptionProps extends Omit<ComponentProps<'input'>, 'type' | 'name' | 'checked' | 'defaultChecked' | 'value'> {
  value: string
  children: ReactNode
}

/** One option. Everything but `className`, which styles the visible label, goes to its radio input. */
export function SegmentedOption({ value, children, className, onChange, ...props }: SegmentedOptionProps) {
  const group = use(SegmentedGroup)
  if (!group) throw new Error('<SegmentedOption> must render inside <Segmented>.')

  return (
    <label className={styles.option}>
      <input
        {...props}
        type='radio'
        className={styles.input}
        name={group.name}
        value={value}
        checked={group.value === value}
        onChange={(event) => {
          onChange?.(event)
          if (!event.defaultPrevented) group.select(value)
        }}
      />
      <span className={className ? `${styles.label} ${className}` : styles.label}>{children}</span>
    </label>
  )
}
