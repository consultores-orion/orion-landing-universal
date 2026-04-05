'use client'

import { useState, useEffect } from 'react'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { CountdownContent, TimeLeft } from './countdown.types'

type CountdownModuleProps = ModuleProps<CountdownContent>

function getTimeLeft(targetDate: string): TimeLeft & { isExpired: boolean } {
  const now = Date.now()
  const target = new Date(targetDate).getTime()
  const diff = Math.max(0, target - now)
  const isExpired = diff === 0
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isExpired,
  }
}

interface TimeBlockProps {
  value: number
  label: string
}

function TimeBlock({ value, label }: TimeBlockProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-20 text-center text-5xl font-black tabular-nums sm:text-7xl"
        style={{ color: 'var(--color-primary)' }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <div
        className="mt-2 text-sm tracking-widest uppercase"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        {label}
      </div>
    </div>
  )
}

function Separator() {
  return (
    <div
      className="mt-2 self-start text-4xl font-bold"
      style={{ color: 'var(--color-muted-foreground)' }}
      aria-hidden="true"
    >
      :
    </div>
  )
}

export default function CountdownModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: CountdownModuleProps) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(content.target_date))

  useEffect(() => {
    if (timeLeft.isExpired) return
    const id = setInterval(() => setTimeLeft(getTimeLeft(content.target_date)), 1000)
    return () => clearInterval(id)
  }, [content.target_date, timeLeft.isExpired])

  const show_days = content.show_days ?? true
  const show_hours = content.show_hours ?? true
  const show_minutes = content.show_minutes ?? true
  const show_seconds = content.show_seconds ?? true

  const daysLabel = t(content.days_label) || (language === 'es' ? 'Días' : 'Days')
  const hoursLabel = t(content.hours_label) || (language === 'es' ? 'Horas' : 'Hours')
  const minutesLabel = t(content.minutes_label) || (language === 'es' ? 'Minutos' : 'Minutes')
  const secondsLabel = t(content.seconds_label) || (language === 'es' ? 'Segundos' : 'Seconds')

  // Build visible blocks with separators between them
  const visibleBlocks: Array<{ value: number; label: string; key: string }> = []
  if (show_days) visibleBlocks.push({ value: timeLeft.days, label: daysLabel, key: 'days' })
  if (show_hours) visibleBlocks.push({ value: timeLeft.hours, label: hoursLabel, key: 'hours' })
  if (show_minutes)
    visibleBlocks.push({ value: timeLeft.minutes, label: minutesLabel, key: 'minutes' })
  if (show_seconds)
    visibleBlocks.push({ value: timeLeft.seconds, label: secondsLabel, key: 'seconds' })

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="countdown" styles={styles}>
      {/* Section header */}
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

      {timeLeft.isExpired ? (
        /* Expired state */
        <div className="flex flex-col items-center gap-6 text-center">
          {content.expired_message && (
            <p className="max-w-lg text-lg" style={{ color: 'var(--color-foreground)' }}>
              {t(content.expired_message)}
            </p>
          )}
          {content.expired_action_url && content.expired_action_label && (
            <a
              href={content.expired_action_url}
              className="inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-foreground)',
              }}
            >
              {t(content.expired_action_label)}
            </a>
          )}
        </div>
      ) : (
        /* Active countdown */
        <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-8">
          {visibleBlocks.map((block, index) => (
            <div key={block.key} className="flex items-start gap-4 sm:gap-8">
              <TimeBlock value={block.value} label={block.label} />
              {index < visibleBlocks.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </ModuleWrapper>
  )
}
