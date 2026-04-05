import type { ModuleSeed } from '@/lib/modules/types'

export const howItWorksSeed: ModuleSeed = {
  key: 'how_it_works',
  defaultOrder: 3,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    paddingX: 'medium',
    maxWidth: 'wide',
  },
  content: {
    title: {
      es: '¿Cómo funciona?',
      en: 'How does it work?',
    },
    subtitle: {
      es: 'En solo tres pasos estarás listo para lanzar tu negocio digital.',
      en: 'In just three steps you will be ready to launch your digital business.',
    },
    layout: 'horizontal',
    steps: [
      {
        number: 1,
        icon: 'UserPlus',
        title: {
          es: 'Crea tu cuenta',
          en: 'Create your account',
        },
        description: {
          es: 'Regístrate en menos de 2 minutos. Sin tarjeta de crédito, sin compromisos. Solo tu correo y listo.',
          en: "Sign up in less than 2 minutes. No credit card, no commitments. Just your email and you're ready.",
        },
      },
      {
        number: 2,
        icon: 'Settings',
        title: {
          es: 'Configura tu sitio',
          en: 'Configure your site',
        },
        description: {
          es: 'Personaliza tu landing con nuestro editor visual intuitivo. Elige colores, textos, imágenes y módulos.',
          en: 'Customize your landing with our intuitive visual editor. Choose colors, texts, images, and modules.',
        },
      },
      {
        number: 3,
        icon: 'Rocket',
        title: {
          es: '¡Lanza y crece!',
          en: 'Launch and grow!',
        },
        description: {
          es: 'Publica tu sitio con un clic. Recibe leads, analiza métricas y escala tu negocio desde el primer día.',
          en: 'Publish your site with one click. Receive leads, analyze metrics, and scale your business from day one.',
        },
      },
    ],
  },
}
