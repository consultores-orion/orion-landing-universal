import { describe, it, expect, vi, afterEach } from 'vitest'
import { getContentForLang, detectBrowserLanguage } from '@/lib/i18n/utils'

describe('getContentForLang', () => {
  it('returns the value for the requested lang when it exists', () => {
    const content = { es: 'Hola', en: 'Hello', fr: 'Bonjour' }
    expect(getContentForLang(content, 'en', 'es')).toBe('Hello')
  })

  it('falls back to defaultLang when requested lang is missing', () => {
    const content = { es: 'Hola', fr: 'Bonjour' }
    expect(getContentForLang(content, 'en', 'es')).toBe('Hola')
  })

  it('falls back to first available value when both lang and defaultLang are missing', () => {
    const content = { fr: 'Bonjour', de: 'Hallo' }
    expect(getContentForLang(content, 'en', 'es')).toBe('Bonjour')
  })

  it('returns a plain string as-is without any lookup', () => {
    expect(getContentForLang('plain text', 'en', 'es')).toBe('plain text')
  })

  it('returns empty string for null content', () => {
    expect(getContentForLang(null, 'en', 'es')).toBe('')
  })

  it('returns empty string for undefined content', () => {
    expect(getContentForLang(undefined, 'en', 'es')).toBe('')
  })

  it('returns empty string for an empty object', () => {
    expect(getContentForLang({}, 'en', 'es')).toBe('')
  })

  it('returns the exact lang value even when defaultLang also exists', () => {
    const content = { es: 'Hola', en: 'Hello' }
    expect(getContentForLang(content, 'es', 'en')).toBe('Hola')
  })
})

describe('detectBrowserLanguage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the 2-letter language code from navigator.language', () => {
    vi.stubGlobal('navigator', { language: 'en-US' })
    expect(detectBrowserLanguage()).toBe('en')
  })

  it('returns lowercase code from a region-tagged language', () => {
    vi.stubGlobal('navigator', { language: 'PT-BR' })
    expect(detectBrowserLanguage()).toBe('pt')
  })

  it('returns the language as-is when no region tag is present', () => {
    vi.stubGlobal('navigator', { language: 'fr' })
    expect(detectBrowserLanguage()).toBe('fr')
  })

  it('returns "es" as fallback when navigator.language is empty', () => {
    vi.stubGlobal('navigator', { language: '' })
    expect(detectBrowserLanguage()).toBe('es')
  })
})
