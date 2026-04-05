'use client'

import { useState } from 'react'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { PricingContent, PricingPlan } from './pricing.types'

type PricingModuleProps = ModuleProps<PricingContent>

export default function PricingModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: PricingModuleProps) {
  const [isAnnual, setIsAnnual] = useState(false)

  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const plans = content.plans ?? []
  const monthlyLabel = t(content.toggle_monthly_label) || 'Monthly'
  const annualLabel = t(content.toggle_annual_label) || 'Annual'
  const savingsLabel = t(content.annual_savings_label) || 'Save 20%'

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="pricing" styles={styles}>
      {/* Header */}
      {(content.title ?? content.subtitle) ? (
        <div className="mb-10 text-center">
          {content.title && (
            <h2
              className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: 'var(--color-foreground)' }}
            >
              {t(content.title)}
            </h2>
          )}
          {content.subtitle && (
            <p className="text-base sm:text-lg" style={{ color: 'var(--color-muted-foreground)' }}>
              {t(content.subtitle)}
            </p>
          )}
        </div>
      ) : null}

      {/* Toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <span
          className="text-sm font-medium"
          style={{ color: isAnnual ? 'var(--color-muted-foreground)' : 'var(--color-foreground)' }}
        >
          {monthlyLabel}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isAnnual}
          onClick={() => setIsAnnual((prev) => !prev)}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
          style={{
            backgroundColor: isAnnual ? 'var(--color-primary)' : 'var(--color-border)',
          }}
        >
          <span
            className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
            style={{ transform: isAnnual ? 'translateX(1.375rem)' : 'translateX(0.25rem)' }}
          />
        </button>
        <span
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: isAnnual ? 'var(--color-foreground)' : 'var(--color-muted-foreground)' }}
        >
          {annualLabel}
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
            }}
          >
            {savingsLabel}
          </span>
        </span>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} isAnnual={isAnnual} t={t} />
        ))}
      </div>
    </ModuleWrapper>
  )
}

interface PricingCardProps {
  plan: PricingPlan
  isAnnual: boolean
  t: (field: Record<string, string> | string | null | undefined) => string
}

function PricingCard({ plan, isAnnual, t }: PricingCardProps) {
  const price = isAnnual ? plan.price_annual : plan.price_monthly
  const period = isAnnual ? t(plan.period_annual) : t(plan.period_monthly)

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 ${plan.is_highlighted ? 'border-2' : 'border'}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: plan.is_highlighted ? 'var(--color-primary)' : 'var(--color-border)',
      }}
    >
      {/* Badge */}
      {plan.is_highlighted && plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="rounded-full px-4 py-1 text-xs font-semibold whitespace-nowrap"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
            }}
          >
            {t(plan.badge)}
          </span>
        </div>
      )}

      {/* Plan name */}
      <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
        {t(plan.name)}
      </h3>

      {/* Description */}
      {plan.description && (
        <p className="mb-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          {t(plan.description)}
        </p>
      )}

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span className="text-4xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            {plan.currency}
            {price}
          </span>
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          {period}
        </p>
      </div>

      {/* Features */}
      <ul className="mb-8 flex flex-col gap-3">
        {plan.features.map((feat) => (
          <li key={feat.id} className="flex items-center gap-2 text-sm">
            <span
              className="shrink-0 font-bold"
              style={{
                color: feat.included ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
              }}
              aria-hidden="true"
            >
              {feat.included ? '✓' : '✗'}
            </span>
            <span
              style={{
                color: feat.included ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
              }}
            >
              {t(feat.text)}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA button — pushed to bottom */}
      <div className="mt-auto">
        <a
          href={plan.cta_url || '#'}
          className="block w-full rounded-lg py-3 text-center font-semibold transition-opacity hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          style={
            plan.is_highlighted
              ? {
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-primary-foreground)',
                }
              : {
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-foreground)',
                }
          }
        >
          {t(plan.cta_label)}
        </a>
      </div>
    </div>
  )
}
