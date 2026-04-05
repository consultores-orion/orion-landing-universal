export type MultilingualContent = Record<string, string>

/**
 * Extrae el texto para el idioma dado, con fallback gracioso.
 * Prioridad: currentLang → defaultLang → primer idioma disponible → ''
 */
export function getContentForLang(
  content: MultilingualContent | string | null | undefined,
  lang: string,
  defaultLang: string,
): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  return content[lang] ?? content[defaultLang] ?? Object.values(content)[0] ?? ''
}

/**
 * Detecta el idioma preferido del navegador.
 * Retorna el código de 2 letras (ISO 639-1), e.g., 'es', 'en'
 */
export function detectBrowserLanguage(): string {
  if (typeof window === 'undefined') return 'es'
  const lang = navigator.language || 'es'
  return lang.split('-')[0]?.toLowerCase() ?? 'es'
}
