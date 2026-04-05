import type { ModuleSeed } from '@/lib/modules/types'

export const socialProofSeed: ModuleSeed = {
  key: 'social_proof',
  defaultOrder: 4,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    paddingX: 'medium',
    maxWidth: 'wide',
  },
  content: {
    title: {
      es: 'Lo que dicen nuestros clientes',
      en: 'What our clients say',
    },
    subtitle: {
      es: 'Más de 1,000 negocios ya transformaron su presencia digital con nosotros.',
      en: 'Over 1,000 businesses have already transformed their digital presence with us.',
    },
    layout: 'carousel',
    testimonials: [
      {
        id: 'testimonial-1',
        quote: {
          es: 'Desde que implementamos esta plataforma, nuestros leads aumentaron un 40% en el primer mes. La configuración fue increíblemente sencilla y el soporte es de otro nivel.',
          en: 'Since we implemented this platform, our leads increased by 40% in the first month. Setup was incredibly easy and the support is on another level.',
        },
        authorName: 'María González',
        authorRole: {
          es: 'Directora de Marketing',
          en: 'Marketing Director',
        },
        company: 'TechVision MX',
        rating: 5,
        authorAvatar: {
          url: '',
          alt: { es: 'Foto de María González', en: 'Photo of María González' },
        },
      },
      {
        id: 'testimonial-2',
        quote: {
          es: 'El panel de administración es intuitivo y poderoso. Puedo actualizar el contenido en minutos sin tocar código. Exactamente lo que necesitaba para mi agencia.',
          en: 'The admin panel is intuitive and powerful. I can update content in minutes without touching code. Exactly what I needed for my agency.',
        },
        authorName: 'Carlos Ramírez',
        authorRole: {
          es: 'CEO & Fundador',
          en: 'CEO & Founder',
        },
        company: 'Creativa Digital',
        rating: 5,
        authorAvatar: {
          url: '',
          alt: { es: 'Foto de Carlos Ramírez', en: 'Photo of Carlos Ramírez' },
        },
      },
      {
        id: 'testimonial-3',
        quote: {
          es: 'El soporte multiidioma cambió todo para nuestro negocio internacional. Ahora llegamos a clientes en 5 países con una sola plataforma. Resultados increíbles.',
          en: 'Multi-language support changed everything for our international business. We now reach clients in 5 countries with a single platform. Incredible results.',
        },
        authorName: 'Ana Lucía Torres',
        authorRole: {
          es: 'Directora de Expansión',
          en: 'Expansion Director',
        },
        company: 'GlobalBiz Solutions',
        rating: 5,
        authorAvatar: {
          url: '',
          alt: { es: 'Foto de Ana Lucía Torres', en: 'Photo of Ana Lucía Torres' },
        },
      },
    ],
  },
}
