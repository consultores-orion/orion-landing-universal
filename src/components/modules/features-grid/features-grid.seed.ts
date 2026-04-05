import type { ModuleSeed } from '@/lib/modules/types'
import type { FeaturesGridContent } from './features-grid.types'

export const featuresGridSeed: ModuleSeed = {
  key: 'features_grid',
  defaultOrder: 15,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    paddingX: 'medium',
    maxWidth: 'wide',
  },
  content: {
    title: {
      es: 'Todo lo que necesitas',
      en: 'Everything you need',
    },
    subtitle: {
      es: 'Herramientas y funcionalidades diseñadas para hacer crecer tu negocio.',
      en: 'Tools and features designed to grow your business.',
    },
    columns: 3,
    show_icon_background: true,
    features: [
      {
        id: 'feat-1',
        icon: 'zap',
        title: { es: 'Ultra rápido', en: 'Ultra fast' },
        description: {
          es: 'Rendimiento optimizado para que tus usuarios tengan la mejor experiencia posible.',
          en: 'Optimized performance so your users have the best possible experience.',
        },
      },
      {
        id: 'feat-2',
        icon: 'shield',
        title: { es: 'Seguridad total', en: 'Total security' },
        description: {
          es: 'Protección avanzada con cifrado de extremo a extremo y autenticación robusta.',
          en: 'Advanced protection with end-to-end encryption and robust authentication.',
        },
      },
      {
        id: 'feat-3',
        icon: 'globe',
        title: { es: 'Alcance global', en: 'Global reach' },
        description: {
          es: 'Llega a tu audiencia en cualquier parte del mundo con soporte multilingüe.',
          en: 'Reach your audience anywhere in the world with multilingual support.',
        },
      },
      {
        id: 'feat-4',
        icon: 'chart',
        title: { es: 'Analíticas en tiempo real', en: 'Real-time analytics' },
        description: {
          es: 'Monitorea el rendimiento de tu sitio con dashboards detallados e intuitivos.',
          en: 'Monitor your site performance with detailed and intuitive dashboards.',
        },
      },
      {
        id: 'feat-5',
        icon: 'settings',
        title: { es: 'Totalmente personalizable', en: 'Fully customizable' },
        description: {
          es: 'Adapta cada aspecto de tu landing page sin escribir una sola línea de código.',
          en: 'Adapt every aspect of your landing page without writing a single line of code.',
        },
      },
      {
        id: 'feat-6',
        icon: 'cloud',
        title: { es: 'En la nube', en: 'Cloud-powered' },
        description: {
          es: 'Infraestructura escalable que crece con tu negocio sin preocupaciones técnicas.',
          en: 'Scalable infrastructure that grows with your business without technical worries.',
        },
      },
    ],
  } satisfies FeaturesGridContent,
}
