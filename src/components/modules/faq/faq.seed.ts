import type { ModuleSeed } from '@/lib/modules/types'
import type { FaqContent } from './faq.types'

export const faqSeed: ModuleSeed = {
  key: 'faq',
  defaultOrder: 7,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    maxWidth: 'default',
  },
  content: {
    title: {
      es: 'Preguntas frecuentes',
      en: 'Frequently Asked Questions',
    },
    subtitle: {
      es: 'Resolvemos tus dudas más comunes para que puedas tomar la mejor decisión.',
      en: 'We answer your most common questions so you can make the best decision.',
    },
    layout: 'single',
    items: [
      {
        id: 'faq-1',
        question: {
          es: '¿Cómo puedo empezar a trabajar con ustedes?',
          en: 'How can I start working with you?',
        },
        answer: {
          es: 'Es muy sencillo. Solo completa el formulario de contacto o escríbenos directamente. Nos pondremos en contacto contigo en menos de 24 horas para conocer tu proyecto y darte una propuesta personalizada.',
          en: 'It is very simple. Just complete the contact form or write to us directly. We will get back to you within 24 hours to learn about your project and give you a personalized proposal.',
        },
      },
      {
        id: 'faq-2',
        question: {
          es: '¿Cuánto tiempo toma ver resultados?',
          en: 'How long does it take to see results?',
        },
        answer: {
          es: 'Los primeros resultados suelen verse entre las 2 y 4 semanas de implementación. Los resultados a largo plazo y más consistentes se consolidan en los primeros 3 meses.',
          en: 'First results are typically seen within 2 to 4 weeks of implementation. Long-term, more consistent results consolidate within the first 3 months.',
        },
      },
      {
        id: 'faq-3',
        question: {
          es: '¿Ofrecen garantía o período de prueba?',
          en: 'Do you offer a guarantee or trial period?',
        },
        answer: {
          es: 'Sí. Ofrecemos un período de prueba de 14 días sin compromiso. Si por alguna razón no estás satisfecho, te devolvemos el 100% de tu inversión.',
          en: 'Yes. We offer a 14-day no-commitment trial period. If for any reason you are not satisfied, we will return 100% of your investment.',
        },
      },
      {
        id: 'faq-4',
        question: {
          es: '¿Tienen soporte técnico disponible?',
          en: 'Do you have technical support available?',
        },
        answer: {
          es: 'Ofrecemos soporte por correo electrónico y chat en horario de lunes a viernes de 9:00 a 18:00. Los clientes de planes premium cuentan con soporte prioritario 24/7.',
          en: 'We offer email and chat support Monday through Friday from 9:00 AM to 6:00 PM. Premium plan customers have priority 24/7 support.',
        },
      },
      {
        id: 'faq-5',
        question: {
          es: '¿Puedo cancelar mi suscripción en cualquier momento?',
          en: 'Can I cancel my subscription at any time?',
        },
        answer: {
          es: 'Absolutamente. No hay permanencia ni cláusulas ocultas. Puedes cancelar tu suscripción cuando quieras desde tu panel de usuario, sin costos adicionales.',
          en: 'Absolutely. There are no lock-in periods or hidden clauses. You can cancel your subscription anytime from your user panel, with no additional costs.',
        },
      },
    ],
  } satisfies FaqContent,
}
