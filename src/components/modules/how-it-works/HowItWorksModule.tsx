import {
  UserPlus,
  Settings,
  Rocket,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  type LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { HowItWorksContent, HowItWorksStep } from './how-it-works.types'

type IconComponent = ComponentType<LucideProps>

const ICON_MAP: Record<string, IconComponent> = {
  UserPlus,
  Settings,
  Rocket,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
}

export default function HowItWorksModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: ModuleProps<HowItWorksContent>) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const layout = content.layout ?? 'horizontal'
  const steps: HowItWorksStep[] = Array.isArray(content.steps) ? content.steps : []

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="how_it_works" styles={styles}>
      {/* Section header */}
      <div className="mb-12 text-center">
        <h2
          className="text-3xl font-bold tracking-tight md:text-4xl"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {t(content.title)}
        </h2>
        {content.subtitle && (
          <p className="mt-4 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            {t(content.subtitle)}
          </p>
        )}
      </div>

      {/* Steps */}
      {layout === 'horizontal' && <HorizontalSteps steps={steps} t={t} />}
      {layout === 'vertical' && <VerticalSteps steps={steps} t={t} />}
      {layout === 'alternating' && <AlternatingSteps steps={steps} t={t} />}
    </ModuleWrapper>
  )
}

type TFn = (field: Record<string, string> | string | null | undefined) => string

function StepIcon({ iconName, size = 20 }: { iconName?: string; size?: number }) {
  const IconComponent: IconComponent | undefined = iconName ? ICON_MAP[iconName] : undefined

  if (!IconComponent) return null

  return <IconComponent size={size} style={{ color: 'var(--color-primary-foreground)' }} />
}

function HorizontalSteps({ steps, t }: { steps: HowItWorksStep[]; t: TFn }) {
  return (
    <div className="relative">
      {/* Connector line (desktop only) */}
      {steps.length > 1 && (
        <div
          className="absolute top-10 right-0 left-0 hidden h-0.5 md:block"
          style={{
            background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`,
            // Only span between first and last circle centers
            marginLeft: `calc(50% / ${steps.length})`,
            marginRight: `calc(50% / ${steps.length})`,
          }}
        />
      )}

      <div
        className={`grid gap-8 md:gap-4 ${
          steps.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : steps.length === 4
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-3'
        }`}
      >
        {steps.map((step, index) => (
          <div key={step.number} className="relative flex flex-col items-center gap-4 text-center">
            {/* Step number circle */}
            <div
              className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold shadow-md"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                color: 'var(--color-primary-foreground)',
              }}
            >
              {step.icon ? <StepIcon iconName={step.icon} size={28} /> : <span>{step.number}</span>}
            </div>

            {/* Step number badge (when icon is shown) */}
            {step.icon && (
              <span
                className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-foreground)',
                }}
              >
                {step.number}
              </span>
            )}

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {t(step.title)}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {t(step.description)}
              </p>
            </div>

            {/* Arrow between steps (mobile) */}
            {index < steps.length - 1 && (
              <div
                className="flex items-center justify-center md:hidden"
                style={{ color: 'var(--color-border)' }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function VerticalSteps({ steps, t }: { steps: HowItWorksStep[]; t: TFn }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, index) => (
        <div key={step.number} className="relative flex gap-6">
          {/* Left column: circle + connector */}
          <div className="flex flex-col items-center">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold shadow"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                color: 'var(--color-primary-foreground)',
              }}
            >
              {step.icon ? <StepIcon iconName={step.icon} size={20} /> : step.number}
            </div>
            {/* Vertical connector */}
            {index < steps.length - 1 && (
              <div
                className="mt-1 w-0.5 flex-1"
                style={{
                  minHeight: '40px',
                  backgroundColor: 'var(--color-border)',
                }}
              />
            )}
          </div>

          {/* Content */}
          <div className="pt-1 pb-8">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {t(step.title)}
            </h3>
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {t(step.description)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function AlternatingSteps({ steps, t }: { steps: HowItWorksStep[]; t: TFn }) {
  return (
    <div className="flex flex-col gap-12">
      {steps.map((step, index) => {
        const isEven = index % 2 === 0
        return (
          <div
            key={step.number}
            className={`flex flex-col gap-6 md:flex-row md:items-center md:gap-12 ${
              !isEven ? 'md:flex-row-reverse' : ''
            }`}
          >
            {/* Step circle */}
            <div className="flex shrink-0 flex-col items-center gap-2 md:w-1/3">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold shadow-lg"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                  color: 'var(--color-primary-foreground)',
                }}
              >
                {step.icon ? <StepIcon iconName={step.icon} size={36} /> : step.number}
              </div>
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {`Paso ${step.number}`}
              </span>
            </div>

            {/* Content */}
            <div
              className={`flex flex-col gap-3 md:w-2/3 ${
                isEven
                  ? 'items-start text-left'
                  : 'items-start text-left md:items-end md:text-right'
              }`}
            >
              <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {t(step.title)}
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {t(step.description)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
