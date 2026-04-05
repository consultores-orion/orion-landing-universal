'use client'

import { useState, useEffect, useRef } from 'react'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { StatsContent } from './stats.types'

type StatsModuleProps = ModuleProps<StatsContent>

interface AnimatedCounterProps {
  end: number
  duration?: number
}

function AnimatedCounter({ end, duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasStarted) {
          setHasStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    const el = ref.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(eased * end))
      if (progress >= 1) {
        setCount(end)
        clearInterval(timer)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [hasStarted, end, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export default function StatsModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: StatsModuleProps) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const items = content.items ?? []
  const isGrid = content.layout === 'grid'

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="stats" styles={styles}>
      {/* Optional header */}
      {(content.title ?? content.subtitle) ? (
        <div className="mb-10 text-center">
          {content.title && (
            <h2
              className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl"
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

      {/* Stats grid */}
      <div
        className={
          isGrid ? 'grid grid-cols-2 gap-8 md:grid-cols-4' : 'grid grid-cols-2 gap-8 sm:grid-cols-4'
        }
      >
        {items.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-2 text-center">
            {/* Animated number */}
            <div
              className="text-4xl font-extrabold tabular-nums sm:text-5xl"
              style={{ color: 'var(--color-primary)' }}
              aria-label={`${item.prefix ?? ''}${item.value}${item.suffix ?? ''}`}
            >
              {item.prefix && <span className="text-3xl sm:text-4xl">{item.prefix}</span>}
              <AnimatedCounter end={item.value} />
              {item.suffix && <span className="text-3xl sm:text-4xl">{item.suffix}</span>}
            </div>

            {/* Label */}
            <p className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>
              {t(item.label)}
            </p>

            {/* Optional description */}
            {item.description && (
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                {t(item.description)}
              </p>
            )}
          </div>
        ))}
      </div>
    </ModuleWrapper>
  )
}
