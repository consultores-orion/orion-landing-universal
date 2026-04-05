import type { ModuleSeed } from '@/lib/modules/types'

export const clientLogosSeed: ModuleSeed = {
  key: 'client_logos',
  defaultOrder: 5,
  defaultEnabled: true,
  styles: {
    paddingY: 'medium',
    paddingX: 'medium',
    maxWidth: 'full',
  },
  content: {
    title: {
      es: 'Empresas que confían en nosotros',
      en: 'Companies that trust us',
    },
    showTitle: true,
    speed: 'normal',
    logos: [
      {
        id: 'logo-1',
        name: 'TechVision',
        logoImage: {
          url: '',
          alt: { es: 'Logo TechVision', en: 'TechVision logo' },
        },
      },
      {
        id: 'logo-2',
        name: 'InnovateCorp',
        logoImage: {
          url: '',
          alt: { es: 'Logo InnovateCorp', en: 'InnovateCorp logo' },
        },
      },
      {
        id: 'logo-3',
        name: 'GlobalBiz',
        logoImage: {
          url: '',
          alt: { es: 'Logo GlobalBiz', en: 'GlobalBiz logo' },
        },
      },
      {
        id: 'logo-4',
        name: 'NexusGroup',
        logoImage: {
          url: '',
          alt: { es: 'Logo NexusGroup', en: 'NexusGroup logo' },
        },
      },
      {
        id: 'logo-5',
        name: 'SkyBrand',
        logoImage: {
          url: '',
          alt: { es: 'Logo SkyBrand', en: 'SkyBrand logo' },
        },
      },
      {
        id: 'logo-6',
        name: 'PioneerCo',
        logoImage: {
          url: '',
          alt: { es: 'Logo PioneerCo', en: 'PioneerCo logo' },
        },
      },
    ],
  },
}
