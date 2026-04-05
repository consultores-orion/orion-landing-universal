import { useCallback } from 'react'
import { getContentForLang } from '@/lib/i18n/utils'
import type { MultilingualText } from './types'

/**
 * Hook que retorna una función `t()` para resolver texto multilingüe
 * desde el contenido de un módulo.
 */
export function useModuleText(
  content: Record<string, unknown>,
  language: string,
  defaultLanguage: string,
) {
  return useCallback(
    (key: string): string => {
      const field = content[key]
      if (field === null || field === undefined) return ''
      if (typeof field === 'string') return field
      if (typeof field === 'object' && !Array.isArray(field)) {
        return getContentForLang(field as MultilingualText, language, defaultLanguage)
      }
      return String(field)
    },
    [content, language, defaultLanguage],
  )
}
