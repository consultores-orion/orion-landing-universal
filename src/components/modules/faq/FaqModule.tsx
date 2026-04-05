import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { FaqContent } from './faq.types'

type FaqModuleProps = ModuleProps<FaqContent>

export default function FaqModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: FaqModuleProps) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const items = content.items ?? []
  const isTwoColumns = content.layout === 'two-columns'

  const faqLdJson = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: t(item.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(item.answer),
      },
    })),
  }

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="faq" styles={styles}>
      {/* Section header */}
      <div className="mb-10 text-center">
        <h2
          className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: 'var(--color-foreground)' }}
        >
          {t(content.title)}
        </h2>
        {content.subtitle && (
          <p
            className="mx-auto max-w-2xl text-base sm:text-lg"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {t(content.subtitle)}
          </p>
        )}
      </div>

      {/* FAQ accordion using native <details>/<summary> */}
      <div
        className={
          isTwoColumns
            ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
            : 'mx-auto flex max-w-3xl flex-col gap-4'
        }
      >
        {items.map((item) => (
          <details
            key={item.id}
            className="group rounded-[var(--border-radius,0.375rem)] border"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <summary
              className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold select-none marker:hidden"
              style={{ color: 'var(--color-foreground)' }}
            >
              <span>{t(item.question)}</span>
              {/* Chevron icon via CSS — rotates when open */}
              <span
                className="flex-shrink-0 text-lg transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
                style={{ color: 'var(--color-primary)' }}
              >
                ▾
              </span>
            </summary>
            <div
              className="border-t px-5 py-4 text-sm leading-relaxed"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-muted-foreground)',
              }}
            >
              {t(item.answer)}
            </div>
          </details>
        ))}
      </div>

      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLdJson) }}
      />
    </ModuleWrapper>
  )
}
