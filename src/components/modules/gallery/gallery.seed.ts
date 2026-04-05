import type { ModuleSeed } from '@/lib/modules/types'
import type { GalleryContent } from './gallery.types'

export const gallerySeed: ModuleSeed = {
  key: 'gallery',
  defaultOrder: 14,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    paddingX: 'medium',
    maxWidth: 'wide',
  },
  content: {
    title: {
      es: 'Nuestra galería',
      en: 'Our Gallery',
    },
    subtitle: {
      es: 'Una muestra de nuestro trabajo y proyectos destacados.',
      en: 'A showcase of our work and featured projects.',
    },
    layout: 'grid',
    columns: 3,
    show_captions: true,
    images: [
      {
        id: 'img-1',
        url: 'https://placehold.co/600x400/3b82f6/ffffff?text=Proyecto+1',
        alt: { es: 'Proyecto 1', en: 'Project 1' },
        caption: { es: 'Diseño de interfaz moderna', en: 'Modern interface design' },
        category: 'design',
      },
      {
        id: 'img-2',
        url: 'https://placehold.co/600x800/8b5cf6/ffffff?text=Proyecto+2',
        alt: { es: 'Proyecto 2', en: 'Project 2' },
        caption: { es: 'Aplicación móvil responsiva', en: 'Responsive mobile app' },
        category: 'mobile',
      },
      {
        id: 'img-3',
        url: 'https://placehold.co/600x400/10b981/ffffff?text=Proyecto+3',
        alt: { es: 'Proyecto 3', en: 'Project 3' },
        caption: { es: 'Panel de administración', en: 'Admin dashboard' },
        category: 'web',
      },
      {
        id: 'img-4',
        url: 'https://placehold.co/800x600/f59e0b/ffffff?text=Proyecto+4',
        alt: { es: 'Proyecto 4', en: 'Project 4' },
        caption: { es: 'Identidad de marca completa', en: 'Complete brand identity' },
        category: 'branding',
      },
      {
        id: 'img-5',
        url: 'https://placehold.co/600x600/ef4444/ffffff?text=Proyecto+5',
        alt: { es: 'Proyecto 5', en: 'Project 5' },
        caption: { es: 'E-commerce de alto rendimiento', en: 'High-performance e-commerce' },
        category: 'web',
      },
      {
        id: 'img-6',
        url: 'https://placehold.co/600x400/06b6d4/ffffff?text=Proyecto+6',
        alt: { es: 'Proyecto 6', en: 'Project 6' },
        caption: { es: 'Plataforma educativa online', en: 'Online educational platform' },
        category: 'web',
      },
    ],
  } satisfies GalleryContent,
}
