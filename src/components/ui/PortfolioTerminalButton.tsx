'use client'

import styles from './PortfolioTerminalButton.module.css'

export const OPEN_PORTFOLIO_TERMINAL = 'portfolio:open-terminal'

export default function PortfolioTerminalButton() {
  return (
    <button
      type='button'
      className={styles.button}
      aria-label='Open portfolio terminal'
      aria-haspopup='dialog'
      aria-keyshortcuts='Control+k Meta+k'
      onClick={(event) => {
        window.dispatchEvent(new CustomEvent(OPEN_PORTFOLIO_TERMINAL, {
          detail: { invoker: event.currentTarget },
        }))
      }}
    >
      <span className={styles.prompt} aria-hidden='true'>❯</span>
      <span>~/portfolio</span>
      <span className={styles.hint}>Open terminal <span aria-hidden='true'>↵</span></span>
    </button>
  )
}
