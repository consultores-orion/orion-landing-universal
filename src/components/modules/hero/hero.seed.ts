import type { ModuleSeed } from '@/lib/modules/types'

export const heroSeed: ModuleSeed = {
  key: 'hero',
  defaultOrder: 1,
  defaultEnabled: true,
  styles: {
    paddingY: 'xlarge',
    paddingX: 'medium',
    maxWidth: 'wide',
  },
  content: {
    title: {
      es: 'Transforma tu negocio con soluciones inteligentes',
      en: 'Transform your business with intelligent solutions',
    },
    subtitle: {
      es: 'Automatiza procesos, conecta con tus clientes y escala sin límites.',
      en: 'Automate processes, connect with your customers, and scale without limits.',
    },
    description: {
      es: 'Más de 1,000 empresas ya confían en nuestra plataforma para impulsar su crecimiento digital de forma rápida y segura.',
      en: 'Over 1,000 businesses already trust our platform to accelerate their digital growth quickly and securely.',
    },
    primaryButton: {
      label: { es: 'Comenzar ahora', en: 'Get started' },
      url: '#contact',
      variant: 'primary',
    },
    secondaryButton: {
      label: { es: 'Saber más', en: 'Learn more' },
      url: '#how-it-works',
      variant: 'outline',
    },
    backgroundImage: {
      url: '',
      alt: { es: '', en: '' },
    },
    backgroundVideo: '',
    overlayOpacity: 0.5,
    layout: 'centered',
  },
}
