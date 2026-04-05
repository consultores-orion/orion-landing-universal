import type { ModuleSeed } from '@/lib/modules/types'
import type { FinalCtaContent } from './final-cta.types'

export const finalCtaSeed: ModuleSeed = {
  key: 'final_cta',
  defaultOrder: 8,
  defaultEnabled: true,
  styles: {
    paddingY: 'xlarge',
    maxWidth: 'default',
  },
  content: {
    title: {
      es: '¿Listo para empezar?',
      en: 'Ready to get started?',
    },
    subtitle: {
      es: 'Únete a más de 500 empresas que ya confían en nosotros.',
      en: 'Join over 500 companies that already trust us.',
    },
    description: {
      es: 'Sin costos ocultos. Sin compromisos a largo plazo. Empieza hoy y descubre por qué somos la elección #1.',
      en: 'No hidden costs. No long-term commitments. Start today and discover why we are the #1 choice.',
    },
    primaryButton: {
      label: {
        es: 'Empieza gratis',
        en: 'Start for free',
      },
      url: '#contact',
    },
    secondaryButton: {
      label: {
        es: 'Ver demostración',
        en: 'Watch a demo',
      },
      url: '#video',
    },
    backgroundStyle: 'gradient',
  } satisfies FinalCtaContent,
}
