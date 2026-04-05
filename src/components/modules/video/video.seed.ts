import type { ModuleSeed } from '@/lib/modules/types'
import type { VideoContent } from './video.types'

export const videoSeed: ModuleSeed = {
  key: 'video',
  defaultOrder: 12,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    maxWidth: 'default',
  },
  content: {
    title: {
      es: 'Míranos en acción',
      en: 'Watch us in action',
    },
    subtitle: {
      es: 'Un vistazo rápido a lo que hacemos y cómo lo hacemos.',
      en: 'A quick look at what we do and how we do it.',
    },
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_type: 'youtube',
    aspect_ratio: '16/9',
    poster_image_url: '',
    autoplay: false,
    caption: {
      es: 'Video demostrativo — 2 minutos',
      en: 'Demo video — 2 minutes',
    },
  } satisfies VideoContent,
}
