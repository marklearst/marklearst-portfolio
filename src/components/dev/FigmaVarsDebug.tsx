'use client'

import { useEffect, useRef } from 'react'
import { useVariables } from '@figma-vars/hooks'

export default function FigmaVarsDebug() {
  const isDev = process.env.NODE_ENV !== 'production'
  const { data, error, isLoading } = useVariables()

  const collectionCount = data?.meta
    ? Object.keys(data.meta.variableCollections).length
    : 0
  const variableCount = data?.meta ? Object.keys(data.meta.variables).length : 0

  const status = isLoading
    ? 'loading'
    : error
    ? 'error'
    : `${collectionCount} collections / ${variableCount} variables`

  const lastStatusRef = useRef<string | null>(null)

  useEffect(() => {
    if (lastStatusRef.current === status) return
    lastStatusRef.current = status
    console.log('[figma-vars]', status)
  }, [status])

  if (!isDev) return null

  return (
    <div className='fixed bottom-4 left-4 z-50 rounded-md border border-white/10 bg-black/60 px-3 py-2 text-[11px] font-mono text-white/60 backdrop-blur'>
      Figma vars: {status}
    </div>
  )
}
