export const HERO_TITLES = [
  ['Design', 'Engineer'],
  ['Frontend', 'Architect'],
  ['Motion', 'Designer'],
  ['Design', 'Systems'],
  ['Frontend', 'Engineer'],
] as const

export const RESTING_SPLIT = 50
export const FINAL_TITLE = HERO_TITLES.length - 1
export type TitlePhase = 'initial' | 'entering' | 'docking' | 'reading' | 'turning' | 'held' | 'finished'
type Context = { motion: string; blocked: boolean }
type Frame = Context & { index: number; phase: TitlePhase }
type Action =
  | { type: 'start'; intro: boolean; context: Context }
  | { type: 'context'; context: Context; incoming: boolean }
  | { type: 'advance'; phase: TitlePhase; index: number }
  | { type: 'hold' | 'toggle'; incoming: boolean }

export const INITIAL_FRAME: Frame = { index: FINAL_TITLE, phase: 'initial', motion: 'default', blocked: false }

export function titleFrame(state: Frame, action: Action): Frame {
  const turning = state.phase === 'turning'
  switch (action.type) {
    case 'start': {
      if (state.phase !== 'initial') return state
      const intro = action.intro && action.context.motion !== 'reduced'
      if (!intro) return { ...action.context, index: FINAL_TITLE, phase: 'finished' }
      return { ...action.context, index: 0, phase: action.context.blocked ? 'reading' : 'entering' }
    }
    case 'context': {
      const { motion, blocked } = action.context
      if (state.motion === motion && state.blocked === blocked) return state
      if (motion === 'reduced' && state.phase !== 'held') return { motion, blocked, index: FINAL_TITLE, phase: 'finished' }
      if (state.phase === 'entering' || state.phase === 'docking') return { motion, blocked, index: 0, phase: 'reading' }
      if (!turning) return { ...state, motion, blocked }
      const index = state.index + Number(action.incoming)
      return { motion, blocked, index, phase: index === FINAL_TITLE ? 'finished' : 'reading' }
    }
    case 'toggle':
      if (state.motion === 'reduced') return { ...state, index: (state.index + 1) % HERO_TITLES.length, phase: 'held' }
      if (state.index === FINAL_TITLE) return { ...state, index: 0, phase: 'entering' }
      if (state.phase === 'held') return { ...state, phase: 'reading' }
      return { ...state, phase: 'held', index: state.index + Number(turning && action.incoming) }
    case 'hold':
      if (state.phase === 'finished' || state.phase === 'held') return state
      return { ...state, phase: 'held', index: state.index + Number(turning && action.incoming) }
    case 'advance': {
      if (state.blocked || state.phase !== action.phase || state.index !== action.index) return state
      if (state.phase === 'entering') return { ...state, phase: 'docking' }
      if (state.phase === 'docking') return { ...state, phase: 'reading' }
      if (state.phase === 'reading') return { ...state, phase: 'turning' }
      if (!turning) return state
      const index = state.index + 1
      return { ...state, index, phase: index === FINAL_TITLE ? 'finished' : 'reading' }
    }
  }
}
