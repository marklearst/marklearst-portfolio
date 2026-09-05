'use client'

import { useSyncExternalStore } from 'react'

const LAST_ROUTE_KEY = 'ml-last-route'
const LAST_ROUTE_EVENT = 'ml-last-route-change'

const getSnapshot = () => {
  if (typeof window === 'undefined') return ''
  try {
    return window.sessionStorage.getItem(LAST_ROUTE_KEY) ?? ''
  } catch {
    return ''
  }
}

const getServerSnapshot = () => ''

const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {}

  const handler = () => callback()
  window.addEventListener('storage', handler)
  window.addEventListener(LAST_ROUTE_EVENT, handler)

  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener(LAST_ROUTE_EVENT, handler)
  }
}

export function useLastRoute() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export const navigationHistoryKeys = {
  LAST_ROUTE_KEY,
  LAST_ROUTE_EVENT,
}
