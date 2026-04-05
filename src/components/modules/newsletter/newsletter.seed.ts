import type { ModuleSeed } from '@/lib/modules/types'
import type { NewsletterContent } from './newsletter.types'

export const newsletterSeed: ModuleSeed = {
  key: 'newsletter',
  defaultOrder: 18,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    paddingX: 'medium',
    maxWidth: 'default',
    backgroundColor: 'var(--color-surface)',
  },
  content: {
    title: {
      es: 'Mantente al día',
      en: 'Stay up to date',
    },
    subtitle: {
      es: 'Suscríbete para recibir novedades, recursos y ofertas exclusivas directamente en tu bandeja de entrada.',
      en: 'Subscribe to receive news, resources, and exclusive offers directly to your inbox.',
    },
    placeholder_email: {
      es: 'tu@email.com',
      en: 'your@email.com',
    },
    button_label: {
      es: 'Suscribirme',
      en: 'Subscribe',
    },
    success_title: {
      es: '¡Listo! Te has suscrito',
      en: 'You are subscribed!',
    },
    success_message: {
      es: 'Gracias por suscribirte. Pronto recibirás nuestras novedades.',
      en: 'Thank you for subscribing. You will hear from us soon.',
    },
    privacy_text: {
      es: 'No enviamos spam. Puedes darte de baja en cualquier momento.',
      en: 'We do not send spam. You can unsubscribe at any time.',
    },
  } satisfies NewsletterContent,
}
