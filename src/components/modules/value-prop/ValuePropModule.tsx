import {
  Zap,
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
  Heart,
  Globe,
  Clock,
  Users,
  TrendingUp,
  Lock,
  type LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { ValuePropContent, ValuePropItem } from './value-prop.types'

type IconComponent = ComponentType<LucideProps>

/** Map of Lucide icon names to their components. Extend as needed. */
const ICON_MAP: Record<string, IconComponent> = {
  Zap,
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
  Heart,
  Globe,
  Clock,
  Users,
  TrendingUp,
  Lock,
}

const COLUMNS_CLASS: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export default function ValuePropModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: ModuleProps<ValuePropContent>) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const columns = content.columns ?? 3
  const layout = content.layout ?? 'cards'
  const gridClass = COLUMNS_CLASS[columns] ?? COLUMNS_CLASS[3]
  const items: ValuePropItem[] = Array.isArray(content.items) ? content.items : []

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="value_prop" styles={styles}>
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

      {/* Items grid */}
      <div className={`grid gap-8 ${gridClass}`}>
        {items.map((item, index) => (
          <ValuePropCard key={index} item={item} layout={layout} t={t} />
        ))}
      </div>
    </ModuleWrapper>
  )
}

function ValuePropCard({
  item,
  layout,
  t,
}: {
  item: ValuePropItem
  layout: string
  t: (field: Record<string, string> | string | null | undefined) => string
}) {
  const IconComponent: IconComponent = ICON_MAP[item.icon] ?? DefaultIcon
  const isCards = layout === 'cards'
  const isIconsTop = layout === 'icons-top'

  if (isCards) {
    return (
      <div
        className="flex flex-col gap-4 rounded-xl p-6 transition-shadow hover:shadow-md"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }}
        >
          <IconComponent size={24} style={{ color: 'var(--color-primary)' }} />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {t(item.title)}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {t(item.description)}
        </p>
      </div>
    )
  }

  if (isIconsTop) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }}
        >
          <IconComponent size={32} style={{ color: 'var(--color-primary)' }} />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {t(item.title)}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {t(item.description)}
        </p>
      </div>
    )
  }

  // minimal layout
  return (
    <div className="flex items-start gap-4">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }}
      >
        <IconComponent size={18} style={{ color: 'var(--color-primary)' }} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {t(item.title)}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {t(item.description)}
        </p>
      </div>
    </div>
  )
}

/** Fallback bullet icon when an icon name is not found in ICON_MAP */
function DefaultIcon({ size = 24, style }: LucideProps) {
  return (
    <span style={{ fontSize: size, lineHeight: 1, ...style }} aria-hidden="true">
      ●
    </span>
  )
}
