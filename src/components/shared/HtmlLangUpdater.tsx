'use client'

import { useEffect } from 'react'
import { useI18n } from '@/lib/i18n/hooks'

/**
 * Updates `document.documentElement.lang` whenever the active language changes.
 *
 * Screen readers rely on the `lang` attribute on `<html>` to select the correct
 * pronunciation engine (WCAG 3.1.1). Because the root layout is a Server Component
 * that cannot read localStorage, this Client Component bridges the gap by keeping
 * the attribute in sync with the i18n context after hydration.
 *
 * Must be rendered inside `<I18nProvider>` — place it in the public layout.
 * Renders no visible DOM.
 */
export function HtmlLangUpdater() {
  const { currentLang } = useI18n()

  useEffect(() => {
    document.documentElement.lang = currentLang
  }, [currentLang])

  return null
}
