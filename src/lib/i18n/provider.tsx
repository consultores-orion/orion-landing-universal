'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
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
  // Always initialize to the server-safe value to avoid hydration mismatch.
  // localStorage / URL params are read after hydration in the useEffect below.
  const [currentLang, setCurrentLang] = useState<string>(initialLang ?? defaultLang)

  // After hydration, detect the user's preferred language from URL, localStorage,
  // or browser settings and update state. This runs only once on mount.
  useEffect(() => {
    let detected: string | null = null

    // URL param has highest priority
    const urlLang = new URL(window.location.href).searchParams.get('lang')
    if (urlLang && languages.some((l) => l.code === urlLang)) {
      localStorage.setItem(STORAGE_KEY, urlLang)
      detected = urlLang
    }

    if (!detected && !initialLang) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && languages.some((l) => l.code === stored)) {
        detected = stored
      }
    }

    if (!detected && !initialLang) {
      const browser = detectBrowserLanguage()
      if (languages.some((l) => l.code === browser)) {
        detected = browser
      }
    }

    if (detected && detected !== (initialLang ?? defaultLang)) {
      setCurrentLang(detected)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
