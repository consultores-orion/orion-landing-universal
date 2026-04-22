'use client'

import { useState } from 'react'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { NewsletterContent } from './newsletter.types'

type NewsletterModuleProps = ModuleProps<NewsletterContent>

export default function NewsletterModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: NewsletterModuleProps) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg(language === 'es' ? 'Email inválido' : 'Invalid email')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source_module: 'newsletter' }),
      })
      if (!res.ok) throw new Error('Error')
      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMsg(
        language === 'es'
          ? 'Ocurrió un error. Intenta de nuevo.'
          : 'An error occurred. Please try again.',
      )
    }
  }

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="newsletter" styles={styles}>
      <div className="mx-auto max-w-xl text-center">
        {/* Header */}
        {content.title && (
          <h2
            className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: 'var(--color-foreground)' }}
          >
            {t(content.title)}
          </h2>
        )}
        {content.subtitle && (
          <p
            className="mb-8 text-base sm:text-lg"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {t(content.subtitle)}
          </p>
        )}

        {/* Success state */}
        {status === 'success' ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl px-6 py-8"
            style={{
              backgroundColor: 'color-mix(in srgb, #22c55e 10%, transparent)',
              border: '1px solid #22c55e',
            }}
          >
            <p className="mb-1 text-xl font-semibold" style={{ color: 'var(--color-foreground)' }}>
              {t(content.success_title)}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              {t(content.success_message)}
            </p>
          </div>
        ) : (
          <>
            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrorMsg('')
                  }}
                  placeholder={t(content.placeholder_email) || 'email@example.com'}
                  className="flex-1 rounded-lg border px-4 py-3 text-sm transition-colors outline-none focus-visible:ring-2"
                  style={{
                    borderColor: errorMsg ? 'var(--color-destructive)' : 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-foreground)',
                  }}
                  aria-label={language === 'es' ? 'Tu dirección de email' : 'Your email address'}
                  aria-invalid={!!errorMsg}
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="rounded-lg px-6 py-3 text-sm font-semibold transition-opacity disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-primary-foreground)',
                    opacity: status === 'loading' ? 0.7 : 1,
                  }}
                >
                  {status === 'loading'
                    ? language === 'es'
                      ? 'Enviando…'
                      : 'Sending…'
                    : t(content.button_label) || (language === 'es' ? 'Suscribirme' : 'Subscribe')}
                </button>
              </div>

              {/* Error message */}
              {(errorMsg || status === 'error') && (
                <p
                  role="alert"
                  className="mt-2 text-sm"
                  style={{ color: 'var(--color-destructive)' }}
                >
                  {errorMsg}
                </p>
              )}
            </form>

            {/* Privacy text */}
            {content.privacy_text && (
              <p
                className="mt-3 text-center text-xs"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                {t(content.privacy_text)}
              </p>
            )}
          </>
        )}
      </div>
    </ModuleWrapper>
  )
}
