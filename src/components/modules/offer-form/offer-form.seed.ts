import type { ModuleSeed } from '@/lib/modules/types'
import type { OfferFormContent } from './offer-form.types'

export const offerFormSeed: ModuleSeed = {
  key: 'offer_form',
  defaultOrder: 6,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    maxWidth: 'narrow',
  },
  content: {
    title: {
      es: 'Contáctanos hoy',
      en: 'Contact us today',
    },
    subtitle: {
      es: 'Completa el formulario y nos pondremos en contacto contigo en menos de 24 horas.',
      en: 'Fill out the form and we will get back to you within 24 hours.',
    },
    fields: [
      {
        key: 'name',
        type: 'text',
        label: { es: 'Nombre completo', en: 'Full name' },
        placeholder: { es: 'Tu nombre', en: 'Your name' },
        required: true,
      },
      {
        key: 'email',
        type: 'email',
        label: { es: 'Correo electrónico', en: 'Email address' },
        placeholder: { es: 'tu@email.com', en: 'you@email.com' },
        required: true,
      },
      {
        key: 'phone',
        type: 'tel',
        label: { es: 'Teléfono', en: 'Phone number' },
        placeholder: { es: '+52 55 0000 0000', en: '+1 555 000 0000' },
        required: false,
      },
      {
        key: 'message',
        type: 'textarea',
        label: { es: 'Mensaje', en: 'Message' },
        placeholder: {
          es: 'Cuéntanos sobre tu proyecto o consulta...',
          en: 'Tell us about your project or inquiry...',
        },
        required: false,
      },
    ] satisfies OfferFormContent['fields'],
    submitLabel: {
      es: 'Enviar mensaje',
      en: 'Send message',
    },
    successMessage: {
      es: '¡Gracias! Te contactaremos pronto.',
      en: "Thank you! We'll contact you soon.",
    },
    sourceModule: 'offer_form',
  } satisfies OfferFormContent,
}
