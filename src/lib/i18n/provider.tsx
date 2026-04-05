'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { detectBrowserLanguage, getContentForLang, type MultilingualContent } from './utils'

export interface Language {
  code: string
  name: string
  native_name: string
  is_default: boolean
  is_active: boolean
  sort_order: number
  flag_emoji: string
}

interface I18nContextValue {
  currentLang: string
  defaultLang: string
  languages: Language[]
  setLang: (lang: string) => void
  t: (field: MultilingualContent | string | null | undefined) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

interface I18nProviderProps {
  children: ReactNode
  languages: Language[]
  defaultLang: string
  initialLang?: string
}

const STORAGE_KEY = 'orion_lang'

export function I18nProvider({ children, languages, defaultLang, initialLang }: I18nProviderProps) {
  const [currentLang, setCurrentLang] = useState<string>(() => {
    if (typeof window === 'undefined') return initialLang ?? defaultLang
    // URL param has highest priority
    const urlLang = new URL(window.location.href).searchParams.get('lang')
    if (urlLang && languages.some((l) => l.code === urlLang)) {
      localStorage.setItem(STORAGE_KEY, urlLang)
      return urlLang
    }
    if (initialLang) return initialLang
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && languages.some((l) => l.code === stored)) return stored
    const browser = detectBrowserLanguage()
    if (languages.some((l) => l.code === browser)) return browser
    return defaultLang
  })

  const setLang = useCallback(
    (lang: string) => {
      if (!languages.some((l) => l.code === lang)) return
      setCurrentLang(lang)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, lang)
        const url = new URL(window.location.href)
        url.searchParams.set('lang', lang)
        window.history.replaceState({}, '', url.toString())
      }
    },
    [languages],
  )

  const t = useCallback(
    (field: MultilingualContent | string | null | undefined): string => {
      return getContentForLang(field, currentLang, defaultLang)
    },
    [currentLang, defaultLang],
  )

  return (
    <I18nContext.Provider value={{ currentLang, defaultLang, languages, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18nContext(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18nContext must be used inside I18nProvider')
  return ctx
}
