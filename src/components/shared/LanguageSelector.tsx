'use client'

import { useI18n } from '@/lib/i18n/hooks'

interface LanguageSelectorProps {
  variant?: 'buttons' | 'dropdown'
  size?: 'sm' | 'md'
}

export function LanguageSelector({ variant = 'buttons', size = 'sm' }: LanguageSelectorProps) {
  const { languages, currentLang, setLang } = useI18n()

  const activeLanguages = languages.filter((l) => l.is_active)

  // Nothing to show if only one active language
  if (activeLanguages.length <= 1) return null

  if (variant === 'dropdown') {
    return (
      <select
        value={currentLang}
        onChange={(e) => setLang(e.target.value)}
        className={`border-border bg-surface text-text-primary focus:ring-primary rounded border focus:ring-2 focus:outline-none ${
          size === 'sm' ? 'px-2 py-1 text-sm' : 'px-3 py-2 text-base'
        }`}
        aria-label="Seleccionar idioma"
      >
        {activeLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag_emoji} {lang.code.toUpperCase()}
          </option>
        ))}
      </select>
    )
  }

  // Default: buttons variant
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Seleccionar idioma">
      {activeLanguages.map((lang) => {
        const isActive = lang.code === currentLang
        return (
          <button
            key={lang.code}
            onClick={() => setLang(lang.code)}
            aria-pressed={isActive}
            aria-label={lang.native_name}
            className={`rounded transition-colors ${
              size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
            } ${
              isActive
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary hover:bg-primary/10'
            }`}
          >
            {lang.flag_emoji} {lang.code.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
