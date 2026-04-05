import type { ModuleSeed } from '@/lib/modules/types'
import type { PricingContent } from './pricing.types'

export const pricingSeed: ModuleSeed = {
  key: 'pricing',
  defaultOrder: 11,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    maxWidth: 'wide',
  },
  content: {
    title: {
      es: 'Planes que se adaptan a ti',
      en: 'Plans that adapt to you',
    },
    subtitle: {
      es: 'Sin contratos. Sin sorpresas. Cancela en cualquier momento.',
      en: 'No contracts. No surprises. Cancel anytime.',
    },
    toggle_monthly_label: { es: 'Mensual', en: 'Monthly' },
    toggle_annual_label: { es: 'Anual', en: 'Annual' },
    annual_savings_label: { es: 'Ahorra 20%', en: 'Save 20%' },
    plans: [
      {
        id: 'plan-basic',
        name: { es: 'Básico', en: 'Basic' },
        description: {
          es: 'Todo lo que necesitas para empezar.',
          en: 'Everything you need to get started.',
        },
        price_monthly: 29,
        price_annual: 23,
        currency: '$',
        period_monthly: { es: '/mes', en: '/month' },
        period_annual: { es: '/mes, facturado anual', en: '/month, billed annually' },
        is_highlighted: false,
        cta_label: { es: 'Empezar gratis', en: 'Start for free' },
        cta_url: '#',
        features: [
          {
            id: 'b-f1',
            text: { es: '5 proyectos activos', en: '5 active projects' },
            included: true,
          },
          { id: 'b-f2', text: { es: 'Hasta 3 usuarios', en: 'Up to 3 users' }, included: true },
          {
            id: 'b-f3',
            text: { es: '10 GB de almacenamiento', en: '10 GB storage' },
            included: true,
          },
          { id: 'b-f4', text: { es: 'Soporte por email', en: 'Email support' }, included: true },
          {
            id: 'b-f5',
            text: { es: 'Analytics avanzados', en: 'Advanced analytics' },
            included: false,
          },
          { id: 'b-f6', text: { es: 'API personalizada', en: 'Custom API' }, included: false },
        ],
      },
      {
        id: 'plan-pro',
        name: { es: 'Pro', en: 'Pro' },
        description: {
          es: 'Para equipos que quieren crecer más rápido.',
          en: 'For teams that want to grow faster.',
        },
        price_monthly: 79,
        price_annual: 63,
        currency: '$',
        period_monthly: { es: '/mes', en: '/month' },
        period_annual: { es: '/mes, facturado anual', en: '/month, billed annually' },
        is_highlighted: true,
        badge: { es: 'Más popular', en: 'Most popular' },
        cta_label: { es: 'Comenzar ahora', en: 'Get started' },
        cta_url: '#',
        features: [
          {
            id: 'p-f1',
            text: { es: 'Proyectos ilimitados', en: 'Unlimited projects' },
            included: true,
          },
          { id: 'p-f2', text: { es: 'Hasta 15 usuarios', en: 'Up to 15 users' }, included: true },
          {
            id: 'p-f3',
            text: { es: '100 GB de almacenamiento', en: '100 GB storage' },
            included: true,
          },
          {
            id: 'p-f4',
            text: { es: 'Soporte prioritario', en: 'Priority support' },
            included: true,
          },
          {
            id: 'p-f5',
            text: { es: 'Analytics avanzados', en: 'Advanced analytics' },
            included: true,
          },
          { id: 'p-f6', text: { es: 'API personalizada', en: 'Custom API' }, included: false },
        ],
      },
      {
        id: 'plan-enterprise',
        name: { es: 'Enterprise', en: 'Enterprise' },
        description: {
          es: 'Soluciones a medida para grandes organizaciones.',
          en: 'Custom solutions for large organizations.',
        },
        price_monthly: 199,
        price_annual: 159,
        currency: '$',
        period_monthly: { es: '/mes', en: '/month' },
        period_annual: { es: '/mes, facturado anual', en: '/month, billed annually' },
        is_highlighted: false,
        cta_label: { es: 'Contactar ventas', en: 'Contact sales' },
        cta_url: '#contact',
        features: [
          {
            id: 'e-f1',
            text: { es: 'Proyectos ilimitados', en: 'Unlimited projects' },
            included: true,
          },
          {
            id: 'e-f2',
            text: { es: 'Usuarios ilimitados', en: 'Unlimited users' },
            included: true,
          },
          {
            id: 'e-f3',
            text: { es: 'Almacenamiento ilimitado', en: 'Unlimited storage' },
            included: true,
          },
          {
            id: 'e-f4',
            text: { es: 'Soporte 24/7 dedicado', en: 'Dedicated 24/7 support' },
            included: true,
          },
          {
            id: 'e-f5',
            text: { es: 'Analytics avanzados', en: 'Advanced analytics' },
            included: true,
          },
          { id: 'e-f6', text: { es: 'API personalizada', en: 'Custom API' }, included: true },
        ],
      },
    ],
  } satisfies PricingContent,
}
