import type { ModuleSeed } from '@/lib/modules/types'
import type { FooterContent } from './footer.types'

export const footerSeed: ModuleSeed = {
  key: 'footer',
  defaultOrder: 9,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    backgroundColor: 'var(--color-surface)',
  },
  content: {
    columns: [
      {
        title: { es: 'Producto', en: 'Product' },
        links: [
          { label: { es: 'Características', en: 'Features' }, url: '#features' },
          { label: { es: 'Precios', en: 'Pricing' }, url: '#pricing' },
          { label: { es: 'Integraciones', en: 'Integrations' }, url: '#integrations' },
          { label: { es: 'Actualizaciones', en: 'Changelog' }, url: '#changelog' },
        ],
      },
      {
        title: { es: 'Empresa', en: 'Company' },
        links: [
          { label: { es: 'Sobre nosotros', en: 'About us' }, url: '#about' },
          { label: { es: 'Blog', en: 'Blog' }, url: '#blog' },
          { label: { es: 'Empleos', en: 'Careers' }, url: '#careers' },
          { label: { es: 'Contacto', en: 'Contact' }, url: '#contact' },
        ],
      },
      {
        title: { es: 'Soporte', en: 'Support' },
        links: [
          { label: { es: 'Documentación', en: 'Documentation' }, url: '#docs' },
          { label: { es: 'Centro de ayuda', en: 'Help center' }, url: '#help' },
          { label: { es: 'Estado del servicio', en: 'Status' }, url: '#status' },
          { label: { es: 'Comunidad', en: 'Community' }, url: '#community' },
        ],
      },
    ],
    copyright: {
      es: '© 2026 Tu Empresa. Todos los derechos reservados.',
      en: '© 2026 Your Company. All rights reserved.',
    },
    showSocialLinks: true,
    socialLinks: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
      linkedin: '#',
      youtube: '#',
    },
    legalLinks: [
      { label: { es: 'Privacidad', en: 'Privacy' }, url: '#privacy' },
      { label: { es: 'Términos', en: 'Terms' }, url: '#terms' },
      { label: { es: 'Cookies', en: 'Cookies' }, url: '#cookies' },
    ],
  } satisfies FooterContent,
}
