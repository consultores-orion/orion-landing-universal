import type { ModuleSeed } from '@/lib/modules/types'
import type { StatsContent } from './stats.types'

export const statsSeed: ModuleSeed = {
  key: 'stats',
  defaultOrder: 10,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    backgroundColor: 'var(--color-surface)',
    maxWidth: 'wide',
  },
  content: {
    title: {
      es: 'Resultados que hablan por sí solos',
      en: 'Results that speak for themselves',
    },
    subtitle: {
      es: 'Números reales de clientes reales.',
      en: 'Real numbers from real customers.',
    },
    layout: 'row',
    items: [
      {
        id: 'stat-1',
        value: 500,
        prefix: '+',
        label: { es: 'Clientes satisfechos', en: 'Satisfied clients' },
        description: { es: 'En más de 20 países', en: 'In over 20 countries' },
      },
      {
        id: 'stat-2',
        value: 98,
        suffix: '%',
        label: { es: 'Satisfacción', en: 'Satisfaction rate' },
        description: { es: 'Según encuestas internas', en: 'Based on internal surveys' },
      },
      {
        id: 'stat-3',
        value: 10000,
        prefix: '+',
        label: { es: 'Proyectos entregados', en: 'Projects delivered' },
        description: { es: 'Desde nuestra fundación', en: 'Since our founding' },
      },
      {
        id: 'stat-4',
        value: 5,
        suffix: '★',
        label: { es: 'Calificación promedio', en: 'Average rating' },
        description: { es: 'En plataformas de reseñas', en: 'On review platforms' },
      },
    ],
  } satisfies StatsContent,
}
