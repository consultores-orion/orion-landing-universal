import type { ModuleSeed } from '@/lib/modules/types'
import type { TeamContent } from './team.types'

export const teamSeed: ModuleSeed = {
  key: 'team',
  defaultOrder: 13,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    maxWidth: 'wide',
  },
  content: {
    title: {
      es: 'Conoce a nuestro equipo',
      en: 'Meet our team',
    },
    subtitle: {
      es: 'Personas apasionadas construyendo el futuro juntas.',
      en: 'Passionate people building the future together.',
    },
    layout: 'grid',
    columns: 4,
    members: [
      {
        id: 'member-1',
        name: 'Ana García',
        role: { es: 'CEO & Cofundadora', en: 'CEO & Co-founder' },
        bio: {
          es: 'Más de 10 años liderando equipos de producto en startups de alto crecimiento.',
          en: 'Over 10 years leading product teams at high-growth startups.',
        },
        avatar_url: '',
        social: {
          twitter: 'https://twitter.com',
          linkedin: 'https://linkedin.com',
        },
      },
      {
        id: 'member-2',
        name: 'Carlos Mendoza',
        role: { es: 'CTO & Cofundador', en: 'CTO & Co-founder' },
        bio: {
          es: 'Arquitecto de software con experiencia en sistemas distribuidos a gran escala.',
          en: 'Software architect with experience in large-scale distributed systems.',
        },
        avatar_url: '',
        social: {
          github: 'https://github.com',
          linkedin: 'https://linkedin.com',
        },
      },
      {
        id: 'member-3',
        name: 'Laura Martínez',
        role: { es: 'Directora de Diseño', en: 'Design Director' },
        bio: {
          es: 'Diseñadora de producto centrada en experiencias que los usuarios aman desde el primer clic.',
          en: 'Product designer focused on experiences users love from the first click.',
        },
        avatar_url: '',
        social: {
          twitter: 'https://twitter.com',
          instagram: 'https://instagram.com',
        },
      },
      {
        id: 'member-4',
        name: 'Diego Rojas',
        role: { es: 'Head of Growth', en: 'Head of Growth' },
        bio: {
          es: 'Especialista en crecimiento orgánico y estrategias de adquisición data-driven.',
          en: 'Specialist in organic growth and data-driven acquisition strategies.',
        },
        avatar_url: '',
        social: {
          linkedin: 'https://linkedin.com',
          website: 'https://example.com',
        },
      },
    ],
  } satisfies TeamContent,
}
