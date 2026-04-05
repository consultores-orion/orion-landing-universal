import type { ModuleSeed } from '@/lib/modules/types'
import type { MapLocationContent } from './map-location.types'

export const mapLocationSeed: ModuleSeed = {
  key: 'map_location',
  defaultOrder: 19,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    paddingX: 'medium',
    maxWidth: 'wide',
  },
  content: {
    title: {
      es: 'Encuéntranos',
      en: 'Find us',
    },
    address: {
      es: 'Av. Paseo de la Reforma 222, Cuauhtémoc, 06600 Ciudad de México, CDMX',
      en: '222 Paseo de la Reforma Ave, Cuauhtémoc, 06600 Mexico City, CDMX',
    },
    map_embed_url:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.4!2d-99.1332!3d19.4284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDI1JzQyLjMiTiA5OcKwMDcnNTkuNSJX!5e0!3m2!1ses!2smx!4v1234567890',
    aspect_ratio: '16/9',
    show_info_panel: true,
    phone: '+52 55 1234 5678',
    email: 'contacto@empresa.com',
    hours: [
      {
        day: { es: 'Lunes – Viernes', en: 'Monday – Friday' },
        hours: '9:00 – 18:00',
        closed: false,
      },
      {
        day: { es: 'Sábado', en: 'Saturday' },
        hours: '10:00 – 14:00',
        closed: false,
      },
      {
        day: { es: 'Domingo', en: 'Sunday' },
        hours: '',
        closed: true,
      },
    ],
  } satisfies MapLocationContent,
}
