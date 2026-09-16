'use client'

import { FigmaVarsProvider } from '@figma-vars/hooks'
import fallbackVariables from '@/data/figma-variables.json'

type FigmaVarsProviderProps = {
  children: React.ReactNode
}

export default function FigmaVarsContextProvider({
  children,
}: FigmaVarsProviderProps) {
  const token = process.env.NEXT_PUBLIC_FIGMA_TOKEN ?? null
  const fileKey = process.env.NEXT_PUBLIC_FIGMA_FILE_KEY ?? null

  return (
    <FigmaVarsProvider
      token={token}
      fileKey={fileKey}
      fallbackFile={fallbackVariables}
      swrConfig={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      {children}
    </FigmaVarsProvider>
  )
}
