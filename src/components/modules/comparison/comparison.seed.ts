import type { ModuleSeed } from '@/lib/modules/types'
import type { ComparisonContent } from './comparison.types'

export const comparisonSeed: ModuleSeed = {
  key: 'comparison',
  defaultOrder: 17,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    paddingX: 'medium',
    maxWidth: 'wide',
  },
  content: {
    title: {
      es: 'Compara nuestros planes',
      en: 'Compare our plans',
    },
    subtitle: {
      es: 'Elige el plan que mejor se adapta a tus necesidades.',
      en: 'Choose the plan that best fits your needs.',
    },
    columns: [
      {
        id: 'col-basic',
        name: { es: 'Básico', en: 'Basic' },
        is_highlighted: false,
      },
      {
        id: 'col-pro',
        name: { es: 'Pro', en: 'Pro' },
        is_highlighted: true,
        badge: { es: 'Recomendado', en: 'Recommended' },
      },
      {
        id: 'col-enterprise',
        name: { es: 'Enterprise', en: 'Enterprise' },
        is_highlighted: false,
      },
    ],
    rows: [
      {
        id: 'row-1',
        feature: { es: 'Usuarios incluidos', en: 'Included users' },
        values: {
          'col-basic': { type: 'text', value: { es: '1 usuario', en: '1 user' } },
          'col-pro': { type: 'text', value: { es: '5 usuarios', en: '5 users' } },
          'col-enterprise': { type: 'text', value: { es: 'Ilimitados', en: 'Unlimited' } },
        },
      },
      {
        id: 'row-2',
        feature: { es: 'Almacenamiento', en: 'Storage' },
        values: {
          'col-basic': { type: 'text', value: { es: '5 GB', en: '5 GB' } },
          'col-pro': { type: 'text', value: { es: '50 GB', en: '50 GB' } },
          'col-enterprise': { type: 'text', value: { es: '500 GB', en: '500 GB' } },
        },
      },
      {
        id: 'row-3',
        feature: { es: 'Soporte prioritario', en: 'Priority support' },
        values: {
          'col-basic': { type: 'cross', value: false },
          'col-pro': { type: 'check', value: true },
          'col-enterprise': { type: 'check', value: true },
        },
      },
      {
        id: 'row-4',
        feature: { es: 'API personalizada', en: 'Custom API' },
        values: {
          'col-basic': { type: 'cross', value: false },
          'col-pro': { type: 'cross', value: false },
          'col-enterprise': { type: 'check', value: true },
        },
      },
      {
        id: 'row-5',
        feature: { es: 'Análisis avanzados', en: 'Advanced analytics' },
        values: {
          'col-basic': { type: 'cross', value: false },
          'col-pro': { type: 'check', value: true },
          'col-enterprise': { type: 'check', value: true },
        },
      },
      {
        id: 'row-6',
        feature: { es: 'SLA garantizado', en: 'Guaranteed SLA' },
        values: {
          'col-basic': { type: 'cross', value: false },
          'col-pro': { type: 'text', value: { es: '99.9%', en: '99.9%' } },
          'col-enterprise': { type: 'text', value: { es: '99.99%', en: '99.99%' } },
        },
      },
    ],
  } satisfies ComparisonContent,
}
