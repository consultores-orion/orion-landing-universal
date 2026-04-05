import type { ModuleSeed } from '@/lib/modules/types'

export const valuePropSeed: ModuleSeed = {
  key: 'value_prop',
  defaultOrder: 2,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    paddingX: 'medium',
    maxWidth: 'wide',
  },
  content: {
    title: {
      es: '¿Por qué elegirnos?',
      en: 'Why choose us?',
    },
    subtitle: {
      es: 'Diseñamos cada detalle para que tu negocio crezca más rápido y con menos esfuerzo.',
      en: 'We design every detail so your business grows faster with less effort.',
    },
    columns: 3,
    layout: 'cards',
    items: [
      {
        icon: 'Zap',
        title: {
          es: 'Velocidad sin límites',
          en: 'Unlimited speed',
        },
        description: {
          es: 'Despliega en minutos. Nuestra infraestructura está optimizada para que llegues al mercado antes que la competencia.',
          en: 'Deploy in minutes. Our infrastructure is optimized so you reach the market before the competition.',
        },
      },
      {
        icon: 'Shield',
        title: {
          es: 'Seguridad de nivel empresarial',
          en: 'Enterprise-grade security',
        },
        description: {
          es: 'Cifrado end-to-end, backups automáticos y cumplimiento de normas internacionales. Tu información siempre protegida.',
          en: 'End-to-end encryption, automatic backups, and compliance with international standards. Your data always protected.',
        },
      },
      {
        icon: 'Star',
        title: {
          es: 'Calidad que se nota',
          en: 'Quality you can feel',
        },
        description: {
          es: 'Cada función está pulida al detalle. No entregamos productos a medias: entregamos experiencias que tus clientes amarán.',
          en: "Every feature is polished to the finest detail. We don't deliver half-baked products — we deliver experiences your customers will love.",
        },
      },
    ],
  },
}
