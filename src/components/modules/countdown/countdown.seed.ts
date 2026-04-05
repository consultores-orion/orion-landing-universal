import type { ModuleSeed } from '@/lib/modules/types'
import type { CountdownContent } from './countdown.types'

export const countdownSeed: ModuleSeed = {
  key: 'countdown',
  defaultOrder: 16,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    paddingX: 'medium',
    maxWidth: 'default',
    backgroundColor: 'var(--color-surface)',
  },
  content: {
    title: {
      es: '¡La oferta termina pronto!',
      en: 'The offer ends soon!',
    },
    subtitle: {
      es: 'No pierdas esta oportunidad única. El tiempo se acaba.',
      en: "Don't miss this unique opportunity. Time is running out.",
    },
    target_date: '2026-07-04T00:00:00',
    expired_message: {
      es: 'Esta oferta ha expirado. ¡Contáctanos para más información!',
      en: 'This offer has expired. Contact us for more information!',
    },
    expired_action_url: '#contact',
    expired_action_label: {
      es: 'Contáctanos',
      en: 'Contact us',
    },
    show_days: true,
    show_hours: true,
    show_minutes: true,
    show_seconds: true,
    days_label: {
      es: 'Días',
      en: 'Days',
    },
    hours_label: {
      es: 'Horas',
      en: 'Hours',
    },
    minutes_label: {
      es: 'Minutos',
      en: 'Minutes',
    },
    seconds_label: {
      es: 'Segundos',
      en: 'Seconds',
    },
  } satisfies CountdownContent,
}
