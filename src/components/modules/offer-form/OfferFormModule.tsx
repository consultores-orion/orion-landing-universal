'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { OfferFormContent, FormField } from './offer-form.types'

type OfferFormModuleProps = ModuleProps<OfferFormContent>

function buildZodSchema(fields: FormField[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    let schema: z.ZodTypeAny

    if (field.type === 'email') {
      schema = z.string().email('Email inválido / Invalid email')
    } else if (field.type === 'textarea' || field.type === 'text' || field.type === 'tel') {
      schema = z.string()
    } else if (field.type === 'select') {
      schema = z.string()
    } else {
      schema = z.string()
    }

    if (field.required) {
      schema = (schema as z.ZodString).min(1, 'Campo requerido / Required field')
    } else {
      schema = schema.optional()
    }

    shape[field.key] = schema
  }

  return z.object(shape)
}

export default function OfferFormModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: OfferFormModuleProps) {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const fields = content.fields ?? []

  const dynamicSchema = useMemo(() => buildZodSchema(fields), [fields])
  type FormValues = z.infer<typeof dynamicSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(dynamicSchema),
  })

  const onSubmit = async (data: FormValues) => {
    setSubmitStatus('loading')
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source_module: content.sourceModule ?? 'offer_form',
        }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      setSubmitStatus('success')
      reset()
    } catch {
      setSubmitStatus('error')
    }
  }

  if (submitStatus === 'success') {
    return (
      <ModuleWrapper moduleId={moduleId} sectionKey="offer_form" styles={styles}>
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}
          />
          <div
            className="flex h-16 w-16 -translate-y-16 items-center justify-center rounded-full text-3xl"
            style={{ color: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            ✓
          </div>
          <p className="text-xl font-semibold" style={{ color: 'var(--color-foreground)' }}>
            {t(content.successMessage)}
          </p>
        </div>
      </ModuleWrapper>
    )
  }

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="offer_form" styles={styles}>
      <div className="mx-auto w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2
            className="mb-2 text-3xl font-bold tracking-tight"
            style={{ color: 'var(--color-foreground)' }}
          >
            {t(content.title)}
          </h2>
          {content.subtitle && (
            <p className="text-base" style={{ color: 'var(--color-muted-foreground)' }}>
              {t(content.subtitle)}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          {fields.map((field) => {
            const fieldLabel = t(field.label)
            const fieldPlaceholder = field.placeholder ? t(field.placeholder) : undefined
            const fieldError = errors[field.key]?.message as string | undefined

            const inputClass =
              'w-full rounded-[var(--border-radius,0.375rem)] border px-4 py-2.5 text-sm transition-colors outline-none focus:ring-2'

            const inputStyle = {
              borderColor: fieldError ? 'var(--color-destructive)' : 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-foreground)',
            } as React.CSSProperties

            return (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label
                  htmlFor={`field-${field.key}`}
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {fieldLabel}
                  {field.required && (
                    <span
                      className="ml-1"
                      style={{ color: 'var(--color-destructive)' }}
                      aria-hidden="true"
                    >
                      *
                    </span>
                  )}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    id={`field-${field.key}`}
                    rows={4}
                    placeholder={fieldPlaceholder}
                    className={inputClass}
                    style={inputStyle}
                    aria-invalid={!!fieldError}
                    aria-describedby={fieldError ? `${field.key}-error` : undefined}
                    {...register(field.key)}
                  />
                ) : field.type === 'select' && field.options && field.options.length > 0 ? (
                  <select
                    id={`field-${field.key}`}
                    className={inputClass}
                    style={inputStyle}
                    aria-invalid={!!fieldError}
                    aria-describedby={fieldError ? `${field.key}-error` : undefined}
                    {...register(field.key)}
                  >
                    <option value="">{fieldPlaceholder ?? '—'}</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.label)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`field-${field.key}`}
                    type={field.type}
                    placeholder={fieldPlaceholder}
                    className={inputClass}
                    style={inputStyle}
                    aria-invalid={!!fieldError}
                    aria-describedby={fieldError ? `${field.key}-error` : undefined}
                    {...register(field.key)}
                  />
                )}

                {fieldError && (
                  <p
                    id={`${field.key}-error`}
                    role="alert"
                    className="text-xs"
                    style={{ color: 'var(--color-destructive)' }}
                  >
                    {fieldError}
                  </p>
                )}
              </div>
            )
          })}

          {/* Error banner */}
          {submitStatus === 'error' && (
            <p
              role="alert"
              className="rounded-[var(--border-radius,0.375rem)] border px-4 py-3 text-sm"
              style={{
                borderColor: 'var(--color-destructive)',
                color: 'var(--color-destructive)',
                backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
              }}
            >
              {language === 'es'
                ? 'Ocurrió un error. Por favor intenta de nuevo.'
                : 'An error occurred. Please try again.'}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitStatus === 'loading'}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-[var(--border-radius,0.375rem)] px-6 py-3 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
            }}
          >
            {submitStatus === 'loading' ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                  style={{
                    borderColor: 'var(--color-primary-foreground)',
                    borderTopColor: 'transparent',
                  }}
                  aria-hidden="true"
                />
                {language === 'es' ? 'Enviando…' : 'Sending…'}
              </>
            ) : (
              t(content.submitLabel)
            )}
          </button>
        </form>
      </div>
    </ModuleWrapper>
  )
}
