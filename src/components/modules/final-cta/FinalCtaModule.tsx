import type { CSSProperties } from 'react'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { FinalCtaContent } from './final-cta.types'

type FinalCtaModuleProps = ModuleProps<FinalCtaContent>

export default function FinalCtaModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: FinalCtaModuleProps) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const bgStyle = content.backgroundStyle ?? 'gradient'

  const sectionStyle: CSSProperties = {}
  if (bgStyle === 'gradient') {
    sectionStyle.background =
      'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
  } else if (bgStyle === 'solid') {
    sectionStyle.backgroundColor = 'var(--color-primary)'
  }

  const isColored = bgStyle === 'gradient' || bgStyle === 'solid'

  const titleColor = isColored ? 'var(--color-primary-foreground)' : 'var(--color-foreground)'
  const subtitleColor = isColored
    ? 'color-mix(in srgb, var(--color-primary-foreground) 85%, transparent)'
    : 'var(--color-muted-foreground)'
  const descriptionColor = isColored
    ? 'color-mix(in srgb, var(--color-primary-foreground) 75%, transparent)'
    : 'var(--color-muted-foreground)'

  const primaryBtnStyle: CSSProperties = isColored
    ? {
        backgroundColor: 'var(--color-primary-foreground)',
        color: 'var(--color-primary)',
      }
    : {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-primary-foreground)',
      }

  const secondaryBtnStyle: CSSProperties = isColored
    ? {
        borderColor: 'var(--color-primary-foreground)',
        color: 'var(--color-primary-foreground)',
      }
    : {
        borderColor: 'var(--color-primary)',
        color: 'var(--color-primary)',
      }

  return (
    <ModuleWrapper
      moduleId={moduleId}
      sectionKey="final_cta"
      styles={styles}
      className="overflow-hidden"
    >
      {/* Colored background overlay that fills the section wrapper */}
      <div className="absolute inset-0 -z-10" style={sectionStyle} aria-hidden="true" />

      {/* Content */}
      <div className="flex flex-col items-center gap-6 text-center">
        <h2
          className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl"
          style={{ color: titleColor }}
        >
          {t(content.title)}
        </h2>

        {content.subtitle && (
          <p className="max-w-xl text-lg font-medium" style={{ color: subtitleColor }}>
            {t(content.subtitle)}
          </p>
        )}

        {content.description && (
          <p className="max-w-2xl text-base" style={{ color: descriptionColor }}>
            {t(content.description)}
          </p>
        )}

        {/* Buttons */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <a
            href={content.primaryButton.url}
            className="rounded-[var(--border-radius,0.375rem)] px-8 py-3 text-base font-semibold transition-opacity hover:opacity-90"
            style={primaryBtnStyle}
          >
            {t(content.primaryButton.label)}
          </a>

          {content.secondaryButton && (
            <a
              href={content.secondaryButton.url}
              className="rounded-[var(--border-radius,0.375rem)] border-2 px-8 py-3 text-base font-semibold transition-opacity hover:opacity-80"
              style={secondaryBtnStyle}
            >
              {t(content.secondaryButton.label)}
            </a>
          )}
        </div>
      </div>
    </ModuleWrapper>
  )
}
