'use client'

import { type ReactNode, useMemo } from 'react'
import { themeConfigToCSSVars } from './utils'
import type { ThemeConfig, PaletteColors } from './types'

interface ThemeProviderProps {
  children: ReactNode
  themeConfig: ThemeConfig
  paletteColors: PaletteColors
}

export function ThemeProvider({ children, themeConfig, paletteColors }: ThemeProviderProps) {
  const cssVars = useMemo(
    () => themeConfigToCSSVars(themeConfig, paletteColors),
    [themeConfig, paletteColors],
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVars} }` }} />
      {children}
    </>
  )
}
